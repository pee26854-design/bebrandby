# BeBrandBy Backend (Node/Express + MySQL)

## Setup
1. Install dependencies
```
npm install
```

2. Create database and tables
```
mysql -u root -p < schema.sql
```

3. If you already have old data where admins are inside `users`, run migration once
```
mysql -u root -p < migrate-split-admins.sql
```

4. Create `.env` from `.env.example` and fill values

5. Run server
```
npm run dev
```

## API (summary)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/orders` (auth optional; member token will attach user_id)
- `GET /api/orders/me` (member)
- `GET /api/orders` (admin)
- `POST /api/notify-deposit` (auth)
