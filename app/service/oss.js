const Service = require('egg').Service;
const crypto = require('crypto-js');

class OssService extends Service {
  // 生成上传参数
  createUploadParams() {
    const { accessKeyId, accessKeySecret, timeout, maxSize } = this.config.oss;
    // 创建 policy
    const policy = this._getPolicyBase64(timeout, maxSize);
    // 创建签名
    const signature = this._getSignature(policy, accessKeySecret);

    return {
      OSSAccessKeyId: accessKeyId,
      policy,
      signature,
    };
  }

  // 创建 Base64 的 policy
  _getPolicyBase64(timeout, maxSize) {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + timeout);

    const policyText = {
      expiration: expiration.toISOString(),
      conditions: [
        [ 'content-length-range', 0, maxSize * 1024 * 1024 ],
      ],
    };

    return Buffer.from(JSON.stringify(policyText)).toString('base64');
  }

  // 使用 Secret 生成签名
  _getSignature(policy, secret) {
    return crypto.enc.Base64.stringify(
      crypto.HmacSHA1(policy, secret)
    );
  }
}

module.exports = OssService;
