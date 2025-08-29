using System.ComponentModel.DataAnnotations;

namespace Domain
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [StringLength(50)]
        public required string Name { get; set; }

        [StringLength(50)]
        public required string Email { get; set; }

        [StringLength(50)]
        public string SurName { get; set; }
        
        [StringLength(50)]
        public string Password { get; set; }
    }
}
