using System.Threading.Tasks;

namespace MobileERP.Application.Services
{
    public interface IDocumentSequenceService
    {
        Task<string> GetNextSequenceAsync(string documentType);
        Task InitializeSequencesForCompanyAsync(int comId);
    }
}
