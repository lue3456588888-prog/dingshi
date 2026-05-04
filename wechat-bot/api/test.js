// api/test.js
export default async function handler(req, res) {
  // 1. 获取环境变量
  const corpid = process.env.CORPID;
  const corpsecret = process.env.CORPSECRET;
  const agentid = process.env.AGENTID;
  const userid = process.env.USERID;

  // 【诊断 A】检查环境变量是否成功注入
  if (!corpid || !corpsecret || !agentid || !userid) {
    return res.status(200).json({
      success: false,
      error: "环境变量缺失！请检查 Vercel 的 Environment Variables 是否填写正确并重新部署。",
      debug_env: { corpid, corpsecret, agentid, userid }
    });
  }

  try {
    // 2. 向微信请求 Token
    const tokenUrl = `https://api.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid.trim()}&corpsecret=${corpsecret.trim()}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenText = await tokenRes.text(); // 先以纯文本读取，防止报错

    // 【诊断 B】检查微信返回的 Token 信息
    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {
      return res.status(200).json({ success: false, error: "微信 Token 接口返回异常", raw_response: tokenText });
    }

    if (!tokenData.access_token) {
      return res.status(200).json({ success: false, error: "获取 Token 失败 (可能是 Secret 错误)", wechat_msg: tokenData });
    }

    const token = tokenData.access_token;

    // 3. 发送微信消息
    const messageBody = {
      touser: userid.trim(),
      msgtype: "text",
      agentid: agentid.trim(),
      text: { content: "🎉 恭喜！你的 Vercel 微信推送助手首次点火成功！" }
    };

    const sendRes = await fetch(`https://api.weixin.qq.com/cgi-bin/message/send?access_token=${token}`, {
      method: 'POST',
      body: JSON.stringify(messageBody)
    });

    const sendText = await sendRes.text();
    
    // 【诊断 C】检查发送结果
    let sendResult;
    try {
      sendResult = JSON.parse(sendText);
    } catch(e) {
      return res.status(200).json({ success: false, error: "微信发送接口返回异常", raw_response: sendText });
    }

    res.status(200).json({ success: true, wechat_response: sendResult });

  } catch (error) {
    res.status(500).json({ success: false, error: "代码执行崩溃", message: error.message });
  }
}
