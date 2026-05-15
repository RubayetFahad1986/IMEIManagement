token=$(curl -s -X POST http://localhost:5237/api/auth/login -d '{"username":"admin", "password":"Admin123"}' -H "Content-Type: application/json" | jq -r .token)
curl -X POST http://localhost:5237/api/erp/sales   -H "Content-Type: application/json"   -H "Authorization: Bearer $token"   -d '{
    "customerId": 2,
    "salesDate": "2026-05-15T10:00:00Z",
    "items": [
      { "inventoryItemId": 4 }
    ],
    "paidAmount": 12000
  }'
