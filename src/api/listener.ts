import { ManagedSerialPortsEvent } from "@/events/managed-serial-ports";
import { PacketEvent } from "@/events/packet";
import { EventCallback, listen, TauriEvent } from "@tauri-apps/api/event";

export enum SerialVauEvents {
  SERIAL_PORT_EVENT = "serial_ports_event",
  SERIAL_PACKET_EVENT = "serial_packet_event",
}

/**
 * Listens for theme change events and invokes the handler when an event occurs.
 * @param handler - The function to call when a theme change event occurs.
 */
export const listenThemeChangedEvent = async <T = string>(
  handler: EventCallback<T>
) => {
  return await listen<T>(TauriEvent.WINDOW_THEME_CHANGED, (event) =>
    handler(event)
  );
};

/**
 * Listens for serial port events and invokes the handler when an event occurs.
 * @param handler - The function to call when a serial port event occurs.
 * @returns A promise that resolves to a callback function that revokes the listener.
 */
export const listenSerialPortEvent = async <T = ManagedSerialPortsEvent>(
  handler: EventCallback<T>
) => {
  return await listen<T>(SerialVauEvents.SERIAL_PORT_EVENT, (event) =>
    handler(event)
  );
};

/**
 * Listens for packet events and invokes the handler when an event occurs.
 * @param handler - The function to call when a packet event occurs.
 * @returns A promise that resolves to a callback function that revokes the listener.
 */
export const listenPacketEvent = async <T = PacketEvent>(
  handler: EventCallback<T>
) => {
  return await listen<T>(SerialVauEvents.SERIAL_PACKET_EVENT, (event) =>
    handler(event)
  );
};
