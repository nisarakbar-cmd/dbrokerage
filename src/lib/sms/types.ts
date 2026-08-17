export interface SmsSender {
  send(phone: string, code: string): Promise<void>;
}
