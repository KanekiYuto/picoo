"use client";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* 用户头像 */}
          <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl md:text-2xl font-bold text-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* 用户信息 */}
          <div className="min-w-0">
            <div className="text-base md:text-lg font-semibold text-foreground truncate">
              {user.name}
            </div>
            <div className="text-xs md:text-sm text-muted truncate">
              {user.email}
            </div>
          </div>
        </div>

        {/* 编辑按钮 */}
        <button className="w-full sm:w-auto px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
          编辑个人资料
        </button>
      </div>
    </div>
  );
}
