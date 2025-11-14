# React Native App 端扫码登录实现指南

这是一个用于 React Native 移动应用的扫码登录功能实现参考。

## 依赖安装

```bash
npm install react-native-camera-kit
npm install @react-native-async-storage/async-storage
```

## 实现代码

### 1. 扫码页面组件 (QRScanScreen.jsx)

```javascript
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Camera } from 'react-native-camera-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function QRScanScreen({ navigation }) {
  const [scanning, setScanning] = useState(true);
  const [confirming, setConfirming] = useState(false);

  // 处理扫码结果
  const handleBarCodeRead = async (event) => {
    if (!scanning || confirming) return;

    setScanning(false);

    try {
      const qrCodeUrl = event.nativeEvent.codeStringValue;

      // 解析二维码URL: nodebbs://qr-login?requestId=xxx
      const url = new URL(qrCodeUrl);

      // 验证URL格式
      if (url.protocol !== 'nodebbs:' || url.pathname !== '//qr-login') {
        Alert.alert('错误', '无效的二维码');
        setScanning(true);
        return;
      }

      const requestId = url.searchParams.get('requestId');
      if (!requestId) {
        Alert.alert('错误', '无效的登录请求');
        setScanning(true);
        return;
      }

      // 显示确认对话框
      Alert.alert(
        '确认登录',
        '是否使用此设备登录到Web端？',
        [
          {
            text: '取消',
            onPress: () => setScanning(true),
            style: 'cancel',
          },
          {
            text: '确认',
            onPress: () => confirmLogin(requestId),
          },
        ]
      );
    } catch (error) {
      console.error('解析二维码失败:', error);
      Alert.alert('错误', '无效的二维码格式');
      setScanning(true);
    }
  };

  // 确认登录
  const confirmLogin = async (requestId) => {
    try {
      setConfirming(true);

      // 获取当前用户的token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('错误', '请先登录App');
        navigation.navigate('Login');
        return;
      }

      // 调用确认登录API
      const response = await fetch('https://api.yourdomain.com/api/auth/qr-login/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`,
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '确认登录失败');
      }

      // 成功
      Alert.alert(
        '成功',
        'Web端登录成功！',
        [
          {
            text: '确定',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('确认登录失败:', error);
      Alert.alert('错误', error.message || '确认登录失败');
      setScanning(true);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 相机扫码界面 */}
      <Camera
        scanBarcode={scanning}
        onReadCode={handleBarCodeRead}
        style={styles.camera}
      />

      {/* 扫码提示 */}
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.tipText}>
          {confirming ? '确认中...' : '扫描Web端二维码登录'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  tipText: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
    marginTop: 40,
  },
});
```

### 2. 在主导航中添加扫码功能

```javascript
import { createStackNavigator } from '@react-navigation/stack';
import { QRScanScreen } from './screens/QRScanScreen';

const Stack = createStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* 其他页面 */}
      <Stack.Screen
        name="QRScan"
        component={QRScanScreen}
        options={{
          title: '扫码登录',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}
```

### 3. 添加扫码入口按钮

```javascript
import { TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export function ProfileScreen({ navigation }) {
  return (
    <View>
      {/* 其他内容 */}

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('QRScan')}
      >
        <Icon name="qr-code-outline" size={24} color="#000" />
        <Text style={styles.scanButtonText}>扫码登录</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  scanButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
```

## 权限配置

### iOS (ios/YourApp/Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机以扫描登录二维码</string>
```

### Android (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

## API 端点

### 确认登录

- **URL**: `POST /api/auth/qr-login/confirm`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "requestId": "二维码中解析的requestId"
  }
  ```
- **响应**:
  - 成功: `{ "message": "登录确认成功" }`
  - 失败: `{ "error": "错误信息" }`

## 流程说明

1. 用户在App中点击"扫码登录"按钮
2. 打开相机扫描Web端显示的二维码
3. 解析二维码获取 `requestId`
4. 显示确认对话框
5. 用户确认后，携带当前用户的token调用确认API
6. 后端验证token并更新登录请求状态
7. Web端轮询获取到登录成功状态，完成登录

## 安全建议

1. **Token管理**: 确保用户token安全存储在 AsyncStorage 中
2. **HTTPS**: 生产环境必须使用HTTPS通信
3. **超时处理**: 二维码有5分钟有效期，过期后需要重新扫码
4. **错误处理**: 完善的错误提示和用户引导
5. **权限检查**: 使用前检查相机权限

## 测试建议

1. 测试二维码过期场景
2. 测试网络异常情况
3. 测试用户未登录App的情况
4. 测试扫描无效二维码的处理
5. 测试同时多个扫码登录请求

## 备注

- 二维码格式: `nodebbs://qr-login?requestId={uniqueId}`
- 默认有效期: 300秒（5分钟）
- 可在系统设置中调整有效期：60-600秒
