// api/test.js
export default async function handler(req, res) {
  const corpid = process.env.CORPID;
  const corpsecret = process.env.CORPSECRET;
  const agentid = process.env.AGENTID;
  const userid = process.env.USERID;

  if (!corpid || !corpsecret || !agentid || !userid) {
    return res.status(200).json({ success: false, error: "环境变量缺失！请检查并重新部署。" });
  }

  try {
    // 【修复点 1】改用企业微信专属的 qyapi 域名获取 Token
    const tokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid.trim()}&corpsecret=${corpsecret.trim()}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json(); 

    if (!tokenData.access_token) {
      return res.status(200).json({ success: false, error: "获取 Token 失败，可能是参数填错啦", wechat_msg: tokenData });
    }

    const token = tokenData.access_token;

    const messageBody = {
      touser: userid.trim(),
      msgtype: "text",
      agentid: agentid.trim(),
      text: { content: "🎉 恭喜！你的 Vercel 推送助手首次点火成功！\n企业微信接口已顺利打通！" }
    };

    // 【修复点 2】改用企业微信专属的 qyapi 域名发送消息
    const sendRes = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`, {
      method: 'POST',
      body: JSON.stringify(messageBody)
    });

    const sendResult = await sendRes.json();
    res.status(200).json({ success: true, wechat_response: sendResult });

  } catch (error) {
    res.status(500).json({ success: false, error: "代码执行崩溃", message: error.message });
  }
}
