token=$(curl -s -X POST http://localhost:5237/api/auth/login -d '{"username":"admin", "password":"Admin123"}' -H "Content-Type: application/json" | jq -r .token)
curl -X POST http://localhost:5237/api/erp/purchase   -H "Content-Type: application/json"   -H "Authorization: Bearer $token"   -d '{
    "supplierId": 1,
    "purchaseDate": "2026-05-15T10:00:00Z",
    "items": [
      { "productId": 1, "costPrice": 10000, "quantity": 1, "conditionId": 1, "mobileDeviceId": 21 }
    ]
  }'
