import { Label } from '@/components/ui/label';
import { useRoleManager } from './hooks/useRoleManager';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Permission } from '@/types/permission';
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';
import { getPermissionTranslation } from '../permission/utils/getPermissionTranslation';

interface RoleFormProps {
  className?: string;
  permissions?: Permission[];
  loading?: boolean;
}

export const RoleForm: React.FC<RoleFormProps> = ({ className, permissions, loading }) => {
  const { t: tSettings } = useTranslation('settings');
  const { t: tPermission } = useTranslation('permissions');

  const roleManager = useRoleManager();

  const groupedPermissions = permissions?.reduce(
    (groups, permission) => {
      const [_, ...rest] = permission?.label?.split('_') || [];
      const entity = rest.join('_');
      if (!groups[entity]) {
        groups[entity] = [];
      }
      groups[entity].push(permission);
      return groups;
    },
    {} as Record<string, Permission[]>
  );

  console.log(groupedPermissions);

  const sortedGroupedPermissions = Object.entries(groupedPermissions || {})
    .sort(([entityA], [entityB]) => entityA.localeCompare(entityB))
    .reduce(
      (sortedGroups, [entity, permissions]) => {
        sortedGroups[entity] = permissions;
        return sortedGroups;
      },
      {} as Record<string, Permission[]>
    );

  const permissionFormFragment = React.useMemo(() => {
    return Object.entries(sortedGroupedPermissions).map(([entity, permissions]) => (
      <Accordion type="multiple" key={entity} className="mt-0">
        <AccordionItem value={entity}>
          <AccordionTrigger className="text-sm font-extrabold">
            {tPermission(`${entity}.singular`)}
          </AccordionTrigger>
          <AccordionContent>
            <div key={entity}>
              {/* Entity Label */}
              <Label className="mb-2"></Label>
              {/* Toggles for Permissions */}
              <div className="flex flex-wrap gap-2 my-2">
                {permissions.map((permission) => {
                  const isSelected = roleManager.isPermissionSelected(permission?.id);
                  return (
                    <Toggle
                      key={permission.id}
                      defaultPressed={isSelected}
                      value={permission?.id?.toString()}
                      onClick={() => {
                        if (isSelected) {
                          roleManager.removePermission(permission?.id);
                        } else {
                          roleManager.addPermission(permission);
                        }
                      }}
                      className="border">
                      {tPermission(`${getPermissionTranslation(permission?.label)}.value`)}
                    </Toggle>
                  );
                })}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ));
  }, [roleManager.permissions]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Label */}
      <div>
        <Label>{tSettings('roles.attributes.label')} (*)</Label>
        <div className="mt-1">
          <Input
            placeholder="Ex. Awesome Administrator"
            value={roleManager.label}
            onChange={(e) => roleManager.set('label', e.target.value)}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label>{tSettings('roles.attributes.description')} (*)</Label>
        <div className="mt-1">
          <Textarea
            placeholder="This is awesome!"
            className="resize-none"
            value={roleManager.description}
            onChange={(e) => roleManager.set('description', e.target.value)}
            rows={7}
          />
        </div>
      </div>

      {/* Permissions */}
      <div className="mt-4">
        <Label>{tSettings('roles.attributes.permissions')} (*)</Label>
        <div className="flex flex-col">{permissionFormFragment}</div>
      </div>
    </div>
  );
};
