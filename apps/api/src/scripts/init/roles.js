/**
 * RBAC 初始化脚本
 * 用于初始化角色和权限数据
 *
 * 所有配置从 config/rbac.js 导入，确保单一数据源
 */

import { eq, and } from 'drizzle-orm';
import {
  roles,
  permissions,
  rolePermissions,
  userRoles,
} from '../../db/schema.js';
import {
  SYSTEM_ROLES,
  SYSTEM_PERMISSIONS,
  ROLE_PERMISSION_MAP,
  ROLE_PERMISSION_CONDITIONS,
  validateRbacConfig,
} from '../../config/rbac.js';

/**
 * 列出 RBAC 配置
 */
export function listRBACConfig() {
  console.log('\n📋 RBAC 配置列表:\n');

  console.log('系统角色:');
  SYSTEM_ROLES.forEach(role => {
    const inheritInfo = role.parentSlug ? ` -> 继承自 ${role.parentSlug}` : ' (基础角色)';
    console.log(`  - ${role.slug}: ${role.name} (优先级: ${role.priority})${inheritInfo}`);
  });

  console.log('\n继承关系:');
  console.log('  admin -> moderator -> vip -> user');

  console.log('\n系统权限:');
  const modulePermissions = {};
  SYSTEM_PERMISSIONS.forEach(perm => {
    if (!modulePermissions[perm.module]) {
      modulePermissions[perm.module] = [];
    }
    modulePermissions[perm.module].push(perm);
  });

  Object.entries(modulePermissions).forEach(([module, perms]) => {
    console.log(`  ${module}:`);
    perms.forEach(perm => {
      console.log(`    - ${perm.slug}: ${perm.name}`);
    });
  });

  console.log('\n角色权限映射:');
  Object.entries(ROLE_PERMISSION_MAP).forEach(([role, perms]) => {
    console.log(`  ${role}: ${perms.length} 个权限`);
  });
}

/**
 * 初始化 RBAC 数据
 */
export async function initRBAC(db, reset = false) {
  // 先校验配置一致性
  const validation = validateRbacConfig();
  if (!validation.valid) {
    console.error('\n❌ RBAC 配置校验失败:');
    validation.errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('RBAC 配置不一致，请检查 config/rbac.js');
  }

  const result = {
    roles: { addedCount: 0, updatedCount: 0, skippedCount: 0, total: SYSTEM_ROLES.length },
    permissions: { addedCount: 0, updatedCount: 0, skippedCount: 0, total: SYSTEM_PERMISSIONS.length },
    rolePermissions: { addedCount: 0, updatedCount: 0, skippedCount: 0, total: 0 },
  };

  console.log('\n📦 初始化 RBAC 系统...\n');

  // 1. 初始化角色
  console.log('🔹 初始化角色...');
  const roleIdMap = {}; // slug -> id 映射

  for (const roleData of SYSTEM_ROLES) {
    // 排除 parentSlug，因为它不是数据库字段
    const { parentSlug, ...roleDataWithoutParent } = roleData;

    const [existing] = await db
      .select()
      .from(roles)
      .where(eq(roles.slug, roleData.slug))
      .limit(1);

    if (existing) {
      if (reset) {
        await db
          .update(roles)
          .set(roleDataWithoutParent)
          .where(eq(roles.slug, roleData.slug));
        result.roles.updatedCount++;
        console.log(`  ✓ 更新角色: ${roleData.slug}`);
      } else {
        result.roles.skippedCount++;
        console.log(`  - 跳过角色: ${roleData.slug} (已存在)`);
      }
      roleIdMap[roleData.slug] = existing.id;
    } else {
      const [inserted] = await db
        .insert(roles)
        .values(roleDataWithoutParent)
        .returning({ id: roles.id });
      result.roles.addedCount++;
      roleIdMap[roleData.slug] = inserted.id;
      console.log(`  ✓ 创建角色: ${roleData.slug}`);
    }
  }

  // 1.5 设置角色继承关系
  console.log('\n🔹 设置角色继承关系...');
  for (const roleData of SYSTEM_ROLES) {
    if (roleData.parentSlug) {
      const roleId = roleIdMap[roleData.slug];
      const parentId = roleIdMap[roleData.parentSlug];

      if (roleId && parentId) {
        await db
          .update(roles)
          .set({ parentId })
          .where(eq(roles.id, roleId));
        console.log(`  ✓ 设置继承: ${roleData.slug} -> ${roleData.parentSlug}`);
      }
    }
  }

  // 2. 初始化权限
  console.log('\n🔹 初始化权限...');
  const permissionIdMap = {}; // slug -> id 映射

  for (const permData of SYSTEM_PERMISSIONS) {
    const [existing] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.slug, permData.slug))
      .limit(1);

    if (existing) {
      if (reset) {
        await db
          .update(permissions)
          .set(permData)
          .where(eq(permissions.slug, permData.slug));
        result.permissions.updatedCount++;
      } else {
        result.permissions.skippedCount++;
      }
      permissionIdMap[permData.slug] = existing.id;
    } else {
      const [inserted] = await db
        .insert(permissions)
        .values(permData)
        .returning({ id: permissions.id });
      result.permissions.addedCount++;
      permissionIdMap[permData.slug] = inserted.id;
    }
  }
  console.log(`  ✓ 权限初始化完成 (新增: ${result.permissions.addedCount}, 更新: ${result.permissions.updatedCount}, 跳过: ${result.permissions.skippedCount})`);

  // 3. 初始化角色权限关联
  console.log('\n🔹 初始化角色权限关联...');

  for (const [roleSlug, permSlugs] of Object.entries(ROLE_PERMISSION_MAP)) {
    const roleId = roleIdMap[roleSlug];
    if (!roleId) {
      console.log(`  ⚠ 跳过角色 ${roleSlug}: 角色不存在`);
      continue;
    }

    const conditions = ROLE_PERMISSION_CONDITIONS[roleSlug] || {};

    // 处理 ['*'] 特殊标记：展开为所有权限
    const actualPermSlugs = (permSlugs.length === 1 && permSlugs[0] === '*')
      ? SYSTEM_PERMISSIONS.map(p => p.slug)
      : permSlugs;

    for (const permSlug of actualPermSlugs) {
      const permissionId = permissionIdMap[permSlug];
      if (!permissionId) {
        console.log(`  ⚠ 跳过权限 ${permSlug}: 权限不存在`);
        continue;
      }

      result.rolePermissions.total++;

      // 使用 upsert 方式
      const conditionJson = conditions[permSlug] ? JSON.stringify(conditions[permSlug]) : null;

      try {
        await db
          .insert(rolePermissions)
          .values({
            roleId,
            permissionId,
            conditions: conditionJson,
          })
          .onConflictDoUpdate({
            target: [rolePermissions.roleId, rolePermissions.permissionId],
            set: { conditions: conditionJson },
          });
        result.rolePermissions.addedCount++;
      } catch (err) {
        // 如果 onConflictDoUpdate 不支持，使用传统方式
        const [existing] = await db
          .select()
          .from(rolePermissions)
          .where(
            and(
              eq(rolePermissions.roleId, roleId),
              eq(rolePermissions.permissionId, permissionId)
            )
          )
          .limit(1);

        if (!existing) {
          await db
            .insert(rolePermissions)
            .values({
              roleId,
              permissionId,
              conditions: conditionJson,
            });
          result.rolePermissions.addedCount++;
        } else {
          result.rolePermissions.skippedCount++;
        }
      }
    }
  }
  console.log(`  ✓ 角色权限关联完成 (新增: ${result.rolePermissions.addedCount}, 跳过: ${result.rolePermissions.skippedCount})`);

  return result;
}

/**
 * 迁移现有用户到 user_roles 表
 * 根据 users.role 字段为用户分配对应角色
 */
export async function migrateExistingUsers(db) {
  console.log('\n🔹 迁移现有用户角色...');

  // 获取所有角色的 ID 映射
  const allRoles = await db.select().from(roles);
  const roleIdMap = {};
  allRoles.forEach(role => {
    roleIdMap[role.slug] = role.id;
  });

  // 获取所有用户
  const { users: usersTable } = await import('../../db/schema.js');
  const allUsers = await db.select({ id: usersTable.id, role: usersTable.role }).from(usersTable);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const user of allUsers) {
    const roleId = roleIdMap[user.role];
    if (!roleId) {
      console.log(`  ⚠ 跳过用户 ${user.id}: 角色 ${user.role} 不存在`);
      skippedCount++;
      continue;
    }

    // 检查是否已分配
    const [existing] = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))
      .limit(1);

    if (existing) {
      skippedCount++;
      continue;
    }

    // 分配角色
    await db.insert(userRoles).values({
      userId: user.id,
      roleId,
    });
    migratedCount++;
  }

  console.log(`  ✓ 用户迁移完成 (迁移: ${migratedCount}, 跳过: ${skippedCount})`);
  return { migratedCount, skippedCount };
}

/**
 * 清理 RBAC 数据（危险操作）
 */
export async function cleanRBAC(db) {
  console.log('\n🗑️ 清理 RBAC 数据...');

  // 按依赖顺序删除
  await db.delete(rolePermissions);
  console.log('  ✓ 已清理角色权限关联');

  await db.delete(userRoles);
  console.log('  ✓ 已清理用户角色关联');

  await db.delete(permissions);
  console.log('  ✓ 已清理权限');

  await db.delete(roles);
  console.log('  ✓ 已清理角色');

  console.log('✅ RBAC 数据清理完成');
}
