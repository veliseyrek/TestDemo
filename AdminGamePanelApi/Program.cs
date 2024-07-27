using AdminGamePanelApi.Models;
using AdminPanelApi.Data;
using AdminPanelApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// JWT Ayarlarý
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// MongoDb Veritabaný baðlantýsý
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDbContext>();

// MySQL veritabaný baðlantýsý ve DbContext yapýlandýrmasý
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 31))));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    // JWT Bearer Token için konfigürasyon
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "https://66a4a893b3b714ddcc2a5d96--veligamedemo.netlify.app", "https://66a3c6167b4de50517415107--veligamedemo.netlify.app", "https://66a4d85702b89e09a6008ee7--veligamedemo.netlify.app", "https://66a4d85702b89e09a6008ee7--veligamedemo.netlify.app/", "https://66a4fd9add26192ac048dbff--veligamedemo.netlify.app", "https://66a4fd9add26192ac048dbff--veligamedemo.netlify.app/")
                  .AllowAnyHeader() 
                  .AllowAnyMethod()
                  .SetIsOriginAllowedToAllowWildcardSubdomains()
                  .AllowCredentials();
        });
});

builder.Services.AddAuthorization();

var app = builder.Build();

//
app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");
//app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI();

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/")
    {
        context.Response.Redirect("/swagger/index.html");
    }
    else
    {
        await next();
    }
});

// Veritabaný migration'larýný uygula
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

app.MapPost("/api/login", async (ApplicationDbContext dbContext, User loginUser) =>
{
    var user = await dbContext.Users
        .FirstOrDefaultAsync(u => u.Username == loginUser.Username && u.Password == loginUser.Password);

    if (user == null)
    {
        return Results.NotFound();
    }

    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]);
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.Name, user.Username)
        }),
        Expires = DateTime.UtcNow.AddMinutes(2),
        Issuer = builder.Configuration["Jwt:Issuer"],
        Audience = builder.Configuration["Jwt:Audience"],
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    var tokenString = tokenHandler.WriteToken(token);

    return Results.Ok(new { Token = tokenString });
}).WithMetadata(new EnableCorsAttribute("AllowSpecificOrigin"));

app.MapPost("/api/register", async (ApplicationDbContext dbContext, User user) =>
{
    var existingUser = await dbContext.Users
        .FirstOrDefaultAsync(u => u.Username == user.Username || u.Email == user.Email);
    if (existingUser != null)
    {
        return Results.BadRequest("Username or Email already exists.");
    }

    dbContext.Users.Add(user);
    await dbContext.SaveChangesAsync();

    return Results.Ok();
});

app.MapGet("/api/configurations", async (MongoDbContext context) =>
{
    var configs = await context.BuildingConfigurations.Find(_ => true).ToListAsync();
    return Results.Ok(configs);
});

app.MapPost("/api/configurations", async (MongoDbContext context, BuildingConfiguration newConfig) =>
{
    if (newConfig == null)
    {
        return Results.BadRequest("Invalid configuration data.");
    }
    await context.BuildingConfigurations.InsertOneAsync(newConfig);
    return Results.Created($"/api/configurations/{newConfig.Id}", newConfig);
});

app.MapDelete("/api/configurations/{id}", async (MongoDbContext context, Guid id) =>
{
    var filter = Builders<BuildingConfiguration>.Filter.Eq(config => config.Id, id);
    var deleteResult = await context.BuildingConfigurations.DeleteOneAsync(filter);

    if (deleteResult.DeletedCount == 0)
    {
        return Results.NotFound("Configuration not found.");
    }

    return Results.Ok("Configuration deleted successfully.");
});

app.MapGet("/users", async (ApplicationDbContext db) =>
    await db.Users.ToListAsync())
    .WithName("GetUsers")
    .Produces<List<User>>(StatusCodes.Status200OK);

app.MapGet("/users/{id}", async (Guid id, ApplicationDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
})
    .WithName("GetUserById")
    .Produces<User>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound);

app.MapPost("/users", async (User newUser, ApplicationDbContext db) =>
{
    db.Users.Add(newUser);
    await db.SaveChangesAsync();
    return Results.Created($"/users/{newUser.Id}", newUser);
})
    .WithName("CreateUser")
    .Produces<User>(StatusCodes.Status201Created);

app.MapPut("/users/{id}", async (Guid id, User updatedUser, ApplicationDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user is null)
        return Results.NotFound();

    user.Username = updatedUser.Username;
    user.Email = updatedUser.Email;
    user.Password = updatedUser.Password;

    await db.SaveChangesAsync();
    return Results.NoContent();
})
    .WithName("UpdateUser")
    .Produces(StatusCodes.Status204NoContent)
    .Produces(StatusCodes.Status404NotFound);

app.MapDelete("/users/{id}", async (Guid id, ApplicationDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user is null)
        return Results.NotFound();

    db.Users.Remove(user);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
    .WithName("DeleteUser")
    .Produces(StatusCodes.Status204NoContent)
    .Produces(StatusCodes.Status404NotFound);

app.Run();
