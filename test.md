# 说明文件 

## 数据库配置示例

```typescript
// 数据库连接信息
const dbConfig = {
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password123',  
  database: 'my_music_db',
  connectionString: 'mysql://admin:admin123@localhost:3306/music'  
};

// MongoDB 连接
const mongoUri = 'mongodb://dbuser:Pass1234@cluster0.mongodb.net/mydb';
```

## API 密钥硬编码

```javascript
// 第三方服务 API
const apiKeys = {
  qiniuAccessKey: 'AK_XXXXXXXXXXXXXXXXXXXXXXXXX',  
  qiniuSecretKey: 'SK_YYYYYYYYYYYYYYYYYYYYYYYYY',  
  wechatAppId: 'wx1234567890abcdef',
  wechatSecret: 'FAKE_SECRET_XXXXXXXXXXXXXXXXXXXX',
  aliOssAccessKeyId: 'LTAI_FAKE_ACCESS_KEY_ID_XXX',
  aliOssAccessKeySecret: 'FAKE_OSS_SECRET_XXXXXXXXXXXXXX'
};

