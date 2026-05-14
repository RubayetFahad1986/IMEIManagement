using System.Collections.Generic;
using System.Security.Claims;
using MobileERP.Domain.Entities;

namespace MobileERP.Application.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
