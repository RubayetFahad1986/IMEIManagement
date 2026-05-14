using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using MobileERP.Application.Services;

namespace MobileERP.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        public int? ComId
        {
            get
            {
                var comIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("ComId");
                if (int.TryParse(comIdClaim, out var comId))
                {
                    return comId;
                }
                return null;
            }
        }

        public string? Role => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }
}
