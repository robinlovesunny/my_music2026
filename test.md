# 安全测试文件 - 包含硬编码敏感信息

本文件用于测试 Qoder 自动代码审查功能,故意包含多种安全问题。

## 数据库配置示例

```typescript
// 硬编码的数据库连接信息
const dbConfig = {
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password123',  // 弱口令
  database: 'my_music_db',
  connectionString: 'mysql://admin:admin123@localhost:3306/music'  // 明文凭证
};

// MongoDB 连接
const mongoUri = 'mongodb://dbuser:Pass1234@cluster0.mongodb.net/mydb';
```

## API 密钥硬编码

```javascript
// 第三方服务 API 密钥
const apiKeys = {
  qiniuAccessKey: 'AK_XXXXXXXXXXXXXXXXXXXXXXXXX',  // 七牛云AK
  qiniuSecretKey: 'SK_YYYYYYYYYYYYYYYYYYYYYYYYY',  // 七牛云SK
  wechatAppId: 'wx1234567890abcdef',
  wechatSecret: 'FAKE_SECRET_XXXXXXXXXXXXXXXXXXXX',
  aliOssAccessKeyId: 'LTAI_FAKE_ACCESS_KEY_ID_XXX',
  aliOssAccessKeySecret: 'FAKE_OSS_SECRET_XXXXXXXXXXXXXX'
};

// 音乐API密钥
const musicApiKey = 'FAKE_MUSIC_API_KEY_XXXXXX';
const lyricApiToken = 'Bearer FAKE_JWT_TOKEN_XXXXXXXXXX';
```

## 用户认证相关

```typescript
// 默认管理员账户
const adminAccount = {
  username: 'admin',
  password: 'admin123',  // 弱密码
  email: 'admin@test.com',
  role: 'superadmin'
};

// JWT 密钥硬编码
const jwtSecret = 'HARDCODED_JWT_SECRET_NOT_SAFE';
const refreshTokenSecret = 'HARDCODED_REFRESH_SECRET';
```

## 加密相关

```python
# AES 加密密钥
AES_KEY = "HARDCODED_AES_KEY"  # 16字节弱密钥
AES_IV = "HARDCODED_AES_IV"

# RSA 私钥直接写在代码中
RSA_PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
FAKE_PRIVATE_KEY_CONTENT_XXXXXXXXX
-----END RSA PRIVATE KEY-----"""
```

## 第三方服务配置

```json
{
  "stripe": {
    "publishableKey": "pk_test_FAKE_PUBLISHABLE_KEY_XXX",
    "secretKey": "sk_test_FAKE_SECRET_KEY_XXXXXXX"
  },
  "sendgrid": {
    "apiKey": "SG.FAKE_SENDGRID_KEY.XXXXXXXXXXXX"
  }
}
```

## 总结

以上代码包含了以下安全问题：
- ❌ 弱口令（password123, admin123等）
- ❌ 硬编码的AK/SK
- ❌ 明文API密钥
- ❌ 数据库连接字符串包含密码
- ❌ JWT密钥硬编码
- ❌ 加密密钥直接暴露
- ❌ 第三方服务凭证未使用环境变量
