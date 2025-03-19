import { storeToRefs } from "pinia";
import { Event, UnlistenFn } from "@tauri-apps/api/event";
import { ref } from "vue";
import { ManagedSerialPortsEvent, PacketEvent } from "@/events";
import {
  listenErrorEvent,
  listenPacketEvent,
  listenSerialPortEvent,
  listenThemeChangedEvent,
} from "@/api/listener";
import { useAppStore } from "@/stores/app";
import { useTheme } from "vuetify";
import { PacketDirectionType, PacketOriginType } from "@/models/packet";

export const useListener = (app = useAppStore()) => {
  const { managedSerialPorts } = storeToRefs(app);
  const { addPortData, getSerialPorts } = app;
  const theme = useTheme();

  const themeChangedEventListener = ref<UnlistenFn>();
  const serialPortEventListener = ref<UnlistenFn>();
  const serialPortPacketEventListener = ref<UnlistenFn>();
  const errorEventListener = ref<UnlistenFn>();

  const onThemeEventListenerTrigger = (event: Event<string>) => {
    const themeName = event.payload;
    if (themeName === "dark" || themeName === "light") {
      theme.global.name.value = themeName;
    }
  };

  const onSerialPortPacketEventListener = async (event: Event<PacketEvent>) => {
    console.debug(event);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const packet = event.payload.packet;

    switch (packet.packetDirection.type) {
      case PacketDirectionType.Incoming:
        addPortData(
          packet.portName,
          `Incoming: ${packet.packetDirection.content.line}`
        );
        break;
      case PacketDirectionType.Outgoing:
        const packetDirectonContent = packet.packetDirection.content;

        switch (packetDirectonContent.packetOrigin.type) {
          case PacketOriginType.Direct:
            addPortData(
              packet.portName,
              `Direct ${packetDirectonContent.value}`
            );
            break;
          case PacketOriginType.Broadcast:
            addPortData(
              packet.portName,
              `Broadcast ${packetDirectonContent.value}`
            );
            break;
          case PacketOriginType.Subscription:
            addPortData(
              packet.portName,
              `Subscription ${packetDirectonContent.value} from ${packetDirectonContent.packetOrigin.content.name}`
            );
            break;
        }
    }
  };

  const onSerialPortEventListener = (event: Event<ManagedSerialPortsEvent>) => {
    managedSerialPorts.value = event.payload.ports;
  };

  const onErrorEventListener = (event: Event<ErrorEvent>) => {
    // TODO: we are only logging the error for now
    console.error(event.payload.error);
  };

  const setupListeners = async () => {
    themeChangedEventListener.value = await listenThemeChangedEvent(
      onThemeEventListenerTrigger
    );

    serialPortEventListener.value = await listenSerialPortEvent(
      onSerialPortEventListener
    );

    serialPortPacketEventListener.value = await listenPacketEvent(
      onSerialPortPacketEventListener
    );

    errorEventListener.value = await listenErrorEvent(onErrorEventListener);

    getSerialPorts();
  };

  const cleanupListeners = () => {
    if (themeChangedEventListener.value) {
      themeChangedEventListener.value();
      themeChangedEventListener.value = undefined;
    }
    if (serialPortEventListener.value) {
      serialPortEventListener.value();
      serialPortEventListener.value = undefined;
    }
    if (serialPortPacketEventListener.value) {
      serialPortPacketEventListener.value();
      serialPortPacketEventListener.value = undefined;
    }
  };

  return {
    setupListeners,
    cleanupListeners,
  };
};
