import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { startOfDay, startOfWeek } from "date-fns";

export type LockReason = 'loss_lock' | 'weekly_loss_lock' | 'daily_trade_limit' | 'weekly_trade_limit' | 'running_trades_limit' | null;

export interface LockStatus {
  locked: boolean;
  reason: LockReason;
  until?: string;
  message: string;
}

export const useLocks = () => {
  const [status, setStatus] = useState<LockStatus>({ locked: false, reason: null, message: "" });
  const [loading, setLoading] = useState(true);

  const checkLocks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const now = new Date();

    // 1. Time-based locks
    if (profile.locked_until && new Date(profile.locked_until) > now) {
      setStatus({
        locked: true,
        reason: 'loss_lock',
        until: profile.locked_until,
        message: "Locked due to recent loss. Reflect to unlock."
      });
      setLoading(false);
      return;
    }

    if (profile.weekly_loss_lock_until && new Date(profile.weekly_loss_lock_until) > now) {
      setStatus({
        locked: true,
        reason: 'weekly_loss_lock',
        until: profile.weekly_loss_lock_until,
        message: "Weekly max loss reached. Locked until next week."
      });
      setLoading(false);
      return;
    }

    // 2. Trade limits
    const today = startOfDay(now).toISOString();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();

    const { data: trades } = await supabase
      .from('trades')
      .select('risk_percent, result, created_at, exit')
      .eq('user_id', user.id)
      .eq('is_backtest', false);

    if (trades) {
      const dailyTrades = trades.filter(t => t.created_at >= today).length;
      const weeklyTrades = trades.filter(t => t.created_at >= weekStart).length;
      const runningTrades = trades.filter(t => t.exit === null && t.result === 'pending').length;

      if (runningTrades >= profile.max_running_trades) {
        setStatus({ locked: true, reason: 'running_trades_limit', message: "Max running trades reached." });
      } else if (dailyTrades >= profile.max_daily_trades) {
        setStatus({ locked: true, reason: 'daily_trade_limit', message: "Daily trade limit reached." });
      } else if (weeklyTrades >= profile.max_weekly_trades) {
        setStatus({ locked: true, reason: 'weekly_trade_limit', message: "Weekly trade limit reached." });
      } else {
        setStatus({ locked: false, reason: null, message: "" });
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    checkLocks();
    const interval = setInterval(checkLocks, 30000);
    return () => clearInterval(interval);
  }, []);

  return { status, loading, checkLocks };
};