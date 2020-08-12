//app.js
App({
  onLaunch: function () {
    // 将当前页面的 this 赋值给 vm, 以区别于下面回调函数中的 this 
    const vm = this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        vm.globalData.code = res.code
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
              vm.globalData.userInfo = res.userInfo
              console.log(res.userInfo)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (vm.userInfoReadyCallback) {
                vm.userInfoReadyCallback(res)
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
        // 1. scope.userLocation 为真， 代表用户已经授权
        if (res.authSetting['scope.userLocation']) {
          // 1.1 使用 getlocation 获取用户 经纬度位置
          wx.getLocation({
              success(res){
                  // 1.2 获取用户位置成功后，将会返回 latitude, longitude 两个字段，代表用户的经纬度位置
                  console.log(res)
                  // 1.3 将获取到的 经纬度传值给 getAddress 解析出 具体的地址
                 vm.getAddress(res.latitude, res.longitude)
              }
          })
         }else {
             // 2. 用户未授权的情况下， 打开授权界面， 引导用户授权.
             wx.openSetting({
                 success(res) {
                     // 2.1 如果二次授权允许了 userLocation 权限， 就再次执行获取位置的接口
                     if (res.authSetting["scope.userLocation"]) {
                          wx.getLocation({
                             success(res){
                                 // 2.2 获取用户位置成功后，将会返回 latitude, longitude 两个字段，代表用户的经纬度位置
                                 console.log(res)
                                 // 2.3 将获取到的 经纬度传值给 getAddress 解析出 具体的地址
                                 vm.getAddress(res.latitude, res.longitude)
                             }
                         })
                     }
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