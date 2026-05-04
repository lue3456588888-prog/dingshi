// api/test.js
export default async function handler(req, res) {
  // 从 Vercel 环境变量读取你刚才收集的 4 个密钥
  const corpid = process.env.CORPID;
  const corpsecret = process.env.CORPSECRET;
  const agentid = process.env.AGENTID;
  const userid = process.env.USERID;

  try {
    // 1. 拿凭证去企业微信换取 Access Token (通行证)
    const tokenUrl = `https://api.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`;
    const tokenRes = await fetch(tokenUrl).then(r => r.json());
    const token = tokenRes.access_token;

    if (!token) throw new Error("获取 Token 失败，请检查 CORPID 和 CORPSECRET");

    // 2. 构造你要发送的消息
    const messageBody = {
      touser: userid, // 发给你自己
      msgtype: "text",
      agentid: agentid,
      text: { 
        content: "🎉 恭喜！你的 Vercel 微信推送助手首次点火成功！\n\n接下来我们可以开始搞天气和喝水提醒了。" 
      }
    };

    // 3. 发送给微信服务器
    const sendRes = await fetch(`https://api.weixin.qq.com/cgi-bin/message/send?access_token=${token}`, {
      method: 'POST',
      body: JSON.stringify(messageBody)
    });
    
    const sendResult = await sendRes.json();
    res.status(200).json({ success: true, wechat_response: sendResult });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}