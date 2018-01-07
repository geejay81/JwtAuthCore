using System.ComponentModel.DataAnnotations;

namespace JwtAuthCore.Models
{
    public class User
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}