'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FeatureSettings({ settings, handleStringChange, handleBooleanChange, handleNumberChange, saving }) {
  return (
    <div className='space-y-4'>
      {/* 注册模式 */}
      {settings.registration_mode && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='p-4 flex items-center justify-between'>
            <div className='space-y-1'>
              <Label htmlFor='registration_mode' className='text-sm font-semibold'>
                注册模式
              </Label>
              <p className='text-sm text-muted-foreground'>
                {settings.registration_mode.description}
              </p>
            </div>
            <Select
              value={settings.registration_mode.value}
              onValueChange={(value) => handleStringChange('registration_mode', value)}
              disabled={saving}
            >
              <SelectTrigger className='max-w-xs'>
                <SelectValue>
                  {settings.registration_mode.value === 'open' && '开放注册'}
                  {settings.registration_mode.value === 'invitation' && '邀请注册'}
                  {settings.registration_mode.value === 'closed' && '关闭注册'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='open'>
                  <div className='flex items-center gap-2'>
                    <span>🌐</span>
                    <div>
                      <div className='font-medium'>开放注册</div>
                      <div className='text-xs text-muted-foreground'>
                        任何人都可以注册
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value='invitation'>
                  <div className='flex items-center gap-2'>
                    <span>🎫</span>
                    <div>
                      <div className='font-medium'>邀请码注册</div>
                      <div className='text-xs text-muted-foreground'>
                        需要邀请码才能注册
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value='closed'>
                  <div className='flex items-center gap-2'>
                    <span>🔒</span>
                    <div>
                      <div className='font-medium'>关闭注册</div>
                      <div className='text-xs text-muted-foreground'>
                        暂停所有新用户注册
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 邮箱验证开关 */}
      {settings.email_verification_required && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='email_verification_required' className='text-sm font-semibold'>
                  邮箱验证要求
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.email_verification_required.description}
                </p>
              </div>
              <Switch
                id='email_verification_required'
                checked={settings.email_verification_required.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('email_verification_required', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 内容审核开关 */}
      {settings.content_moderation_enabled && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='content_moderation_enabled' className='text-sm font-semibold'>
                  内容审核
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.content_moderation_enabled.description}
                </p>
              </div>
              <Switch
                id='content_moderation_enabled'
                checked={settings.content_moderation_enabled.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('content_moderation_enabled', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 扫码登录功能 */}
      {settings.qr_login_enabled && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='qr_login_enabled' className='text-sm font-semibold'>
                  扫码登录功能
                </Label>
                <p className='text-sm text-muted-foreground'>
                  允许用户使用手机App扫描二维码登录
                </p>
              </div>
              <Switch
                id='qr_login_enabled'
                checked={settings.qr_login_enabled.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('qr_login_enabled', checked)
                }
                disabled={saving}
              />
            </div>

            {/* 二维码有效期设置 */}
            {settings.qr_login_enabled.value && settings.qr_login_timeout && (
              <div className='mt-4 pt-4 border-t border-border'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='space-y-1 flex-1'>
                    <Label htmlFor='qr_login_timeout' className='text-sm font-medium'>
                      二维码有效期（秒）
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      二维码登录请求的有效期，建议设置为 60-600 秒
                    </p>
                  </div>
                  <Input
                    id='qr_login_timeout'
                    type='number'
                    min='60'
                    max='600'
                    className='w-24'
                    value={settings.qr_login_timeout.value}
                    onChange={(e) =>
                      handleNumberChange('qr_login_timeout', e.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 用户设置分隔符 */}
      <div className='pt-4 pb-2'>
        <h3 className='text-lg font-semibold'>用户设置</h3>
        <p className='text-sm text-muted-foreground'>管理用户修改个人信息的权限和限制</p>
      </div>

      {/* 用户名修改开关 */}
      {settings.allow_username_change && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='allow_username_change' className='text-sm font-semibold'>
                  允许修改用户名
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.allow_username_change.description}
                </p>
              </div>
              <Switch
                id='allow_username_change'
                checked={settings.allow_username_change.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('allow_username_change', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 用户名修改冷却期 */}
      {settings.username_change_cooldown_days && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='space-y-1 flex-1'>
                <Label htmlFor='username_change_cooldown_days' className='text-sm font-semibold'>
                  用户名修改冷却期（天）
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.username_change_cooldown_days.description}
                </p>
              </div>
              <Input
                id='username_change_cooldown_days'
                type='number'
                min='0'
                className='w-24'
                value={settings.username_change_cooldown_days.value}
                onChange={(e) =>
                  handleNumberChange('username_change_cooldown_days', e.target.value)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 用户名修改次数限制 */}
      {settings.username_change_limit && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='space-y-1 flex-1'>
                <Label htmlFor='username_change_limit' className='text-sm font-semibold'>
                  用户名修改次数限制
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.username_change_limit.description}（0表示无限制）
                </p>
              </div>
              <Input
                id='username_change_limit'
                type='number'
                min='0'
                className='w-24'
                value={settings.username_change_limit.value}
                onChange={(e) =>
                  handleNumberChange('username_change_limit', e.target.value)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 用户名修改需要密码 */}
      {settings.username_change_requires_password && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='username_change_requires_password' className='text-sm font-semibold'>
                  修改用户名需要密码验证
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.username_change_requires_password.description}
                </p>
              </div>
              <Switch
                id='username_change_requires_password'
                checked={settings.username_change_requires_password.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('username_change_requires_password', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 邮箱修改开关 */}
      {settings.allow_email_change && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='allow_email_change' className='text-sm font-semibold'>
                  允许修改邮箱
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.allow_email_change.description}
                </p>
              </div>
              <Switch
                id='allow_email_change'
                checked={settings.allow_email_change.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('allow_email_change', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 邮箱修改需要密码 */}
      {settings.email_change_requires_password && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='email_change_requires_password' className='text-sm font-semibold'>
                  修改邮箱需要密码验证
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.email_change_requires_password.description}
                </p>
              </div>
              <Switch
                id='email_change_requires_password'
                checked={settings.email_change_requires_password.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('email_change_requires_password', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 邮箱修改验证码有效期 */}
      {settings.email_change_verification_expires_minutes && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='space-y-1 flex-1'>
                <Label htmlFor='email_change_verification_expires_minutes' className='text-sm font-semibold'>
                  邮箱修改验证码有效期（分钟）
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.email_change_verification_expires_minutes.description}
                </p>
              </div>
              <Input
                id='email_change_verification_expires_minutes'
                type='number'
                min='5'
                max='60'
                className='w-24'
                value={settings.email_change_verification_expires_minutes.value}
                onChange={(e) =>
                  handleNumberChange('email_change_verification_expires_minutes', e.target.value)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
