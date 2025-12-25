"use client";

interface Organization {
  id: string;
  name: string;
  memberCount: number;
  role: string;
}

interface TeamListProps {
  organizations: Organization[];
}

const roleMap: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export function TeamList({ organizations }: TeamListProps) {
  if (organizations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
        <div className="text-sm text-muted text-center">No teams yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {organizations.map((org) => (
        <div
          key={org.id}
          className="bg-card border border-border rounded-2xl p-5 md:p-6 hover:bg-sidebar-hover transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 md:gap-4">
            {/* 团队图标 */}
            <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base md:text-lg">
              {org.name.charAt(0).toUpperCase()}
            </div>

            {/* 团队信息 */}
            <div className="min-w-0">
              <div className="text-sm md:text-base font-semibold text-foreground truncate">
                {org.name}
              </div>
              <div className="text-xs md:text-sm text-muted">
                {(roleMap[org.role] ?? org.role)} • {org.memberCount}{" "}
                {org.memberCount === 1 ? "member" : "members"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
