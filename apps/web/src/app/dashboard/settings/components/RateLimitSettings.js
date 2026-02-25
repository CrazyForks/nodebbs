'use client';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { SettingSection, SettingItem } from '@/components/common/SettingLayout';

export function RateLimitSettings({ settings, handleBooleanChange, handleNumberChange, saving }) {
  return (
    <div className='space-y-6'>
      <SettingSection title="访问限速 (Rate Limit)" description="防止接口被恶意高频调用（重启 API 服务生效）">
        {settings.rate_limit_enabled && (
          <SettingItem
            title="启用访问限速"
            description={settings.rate_limit_enabled.description}
          >
            <Switch
              id='rate_limit_enabled'
              checked={settings.rate_limit_enabled.value}
              onCheckedChange={(checked) =>
                handleBooleanChange('rate_limit_enabled', checked)
              }
              disabled={saving}
            />
          </SettingItem>
        )}

        {settings.rate_limit_window_ms && (
          <SettingItem
            title="限速时间窗口（毫秒）"
            description={
              <span>
                {settings.rate_limit_window_ms.description}
                <br />
                <span className="text-xs text-muted-foreground/80 mt-1 inline-block">
                  当前值: {Math.round(settings.rate_limit_window_ms.value / 1000)} 秒
                </span>
              </span>
            }
          >
            <Input
              id='rate_limit_window_ms'
              type='number'
              defaultValue={settings.rate_limit_window_ms.value}
              onBlur={(e) =>
                handleNumberChange('rate_limit_window_ms', e.target.value)
              }
              disabled={saving}
              className='w-32'
            />
          </SettingItem>
        )}

        {settings.rate_limit_max_requests && (
          <SettingItem
            title="时间窗口内最大请求数"
            description={settings.rate_limit_max_requests.description}
          >
            <Input
              id='rate_limit_max_requests'
              type='number'
              defaultValue={settings.rate_limit_max_requests.value}
              onBlur={(e) =>
                handleNumberChange('rate_limit_max_requests', e.target.value)
              }
              disabled={saving}
              className='w-32'
            />
          </SettingItem>
        )}

        {settings.rate_limit_auth_multiplier && (
          <SettingItem
            title="已登录用户限速倍数"
            description={
              <span>
                {settings.rate_limit_auth_multiplier.description}
                <br />
                <span className="text-xs text-muted-foreground/80 mt-1 inline-block">
                  已登录用户限制:{' '}
                  {settings.rate_limit_max_requests?.value &&
                    Math.floor(
                      settings.rate_limit_max_requests.value *
                        settings.rate_limit_auth_multiplier.value
                    )}{' '}
                  请求
                </span>
              </span>
            }
          >
            <Input
              id='rate_limit_auth_multiplier'
              type='number'
              step='0.1'
              defaultValue={settings.rate_limit_auth_multiplier.value}
              onBlur={(e) =>
                handleNumberChange('rate_limit_auth_multiplier', e.target.value)
              }
              disabled={saving}
              className='w-32'
            />
          </SettingItem>
        )}
      </SettingSection>
    </div>
  );
}
