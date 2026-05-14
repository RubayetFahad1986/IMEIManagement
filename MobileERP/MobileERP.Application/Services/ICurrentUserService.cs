namespace MobileERP.Application.Services
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        int? ComId { get; }
        string? Role { get; }
        bool IsAuthenticated { get; }
    }
}
