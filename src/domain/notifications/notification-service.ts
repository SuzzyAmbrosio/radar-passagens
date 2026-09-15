export interface NotificationService { send(input: { userId: string; title: string; body: string }): Promise<void>; }
/** Placeholder: configure an email, push, or messaging implementation later. */
export class NoopNotificationService implements NotificationService { async send(): Promise<void> {} }
