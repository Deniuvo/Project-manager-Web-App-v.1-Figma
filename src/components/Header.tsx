import { User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  isLoggedIn: boolean;
  userName: string;
  onAccountClick: () => void;
  onLogout: () => void;
}

export function Header({ isLoggedIn, userName, onAccountClick, onLogout }: HeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* University info */}
        <div>
          <h1 className="text-lg font-medium text-foreground">
            Чеченский Государственный университет им. А.А. Кадырова
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Программы развития "Приоритет-2030"
          </p>
        </div>

        {/* Account section */}
        <div>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-3 h-11 px-4 rounded-xl border-border bg-card hover:bg-accent hover:border-primary/20 transition-all duration-200"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                      {userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onAccountClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Учетная запись
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={onAccountClick}
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <User className="h-4 w-4" />
              Учетная запись
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}