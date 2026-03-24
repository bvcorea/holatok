import ko from "../messages/ko.json";
import es from "../messages/es.json";
import ptBR from "../messages/pt-BR.json";

export const messages = {
  ko,
  es,
  "pt-BR": ptBR,
} as const;

export type Messages = typeof messages;
export type MessageKey = keyof Messages;
