namespace AdminPanelApi.Models
{
    public class BuildingConfiguration
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string BuildingType { get; set; }
        public decimal BuildingCost { get; set; }
        public int ConstructionTime { get; set; }
    }
}
