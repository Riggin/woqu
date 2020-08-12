//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.code = res.code
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log(res.userInfo)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              console.log(JSON.stringify(res))
              wx.request({
                url: getApp().globalData.urlPath + "wx/getOpenid",
                data: {
                  code: getApp().globalData.code,
                  encryptedData: res.encryptedData,
                  iv: res.iv
                },
                method: "Get",
                header: {
                  'content-type': 'application/x-www-form-urlencoded',
                },
                success: function (res2) {
                  console.log("登录返回的数据：" + res2);
                  // 落库数据
                  wx.request({
                    url: getApp().globalData.urlPath + "user/add",
                    data: JSON.stringify(res2.data.data),
                    method: "Post",
                    header: {
                      'content-type': 'application/json',
                    },
                    success: function (res) {
                      console.log(res)
                    }
                  })
                },
                fail: function (error) {
                  console.log(error);
                }
              })
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    urlPath: "http://localhost:8003/",
    code: null
  }
})