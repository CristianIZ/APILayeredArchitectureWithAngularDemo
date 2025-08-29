namespace Common
{
    public class Settings
    {
        public ConnectionStrings ConnectionStrings { get; set; } = new ConnectionStrings();
    }

    public class ConnectionStrings
    {
        public string LocalDatabase { get; set; } = "";
    }
}
