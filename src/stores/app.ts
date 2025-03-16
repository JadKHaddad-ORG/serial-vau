import { PacketData } from "@/models/intern/packet-data";
import { ManagedSerialPort } from "@/models/managed-serial-port";
import { OpenSerialPortOptions } from "@/models/open-options";
import { defineStore } from "pinia";
import * as api from "@/api/api";

export const useAppStore = defineStore("app", () => {
  const managedSerialPorts = ref<ManagedSerialPort[]>([]);
  const packets = ref<Record<string, PacketData[]>>({});
  const portData = ref<{ [key: string]: string[] }>({});

  function getSerialPorts() {
    api
      .getSerialPorts()
      .then((response) => {
        managedSerialPorts.value = response;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async function openSerialPort(name: string, options: OpenSerialPortOptions) {
    await api
      .openSerialPort(name, options)
      .then((response) => {
        managedSerialPorts.value = response;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async function closeSerialPort(name: string) {
    await api
      .closeSerialPort(name)
      .then((response) => {
        managedSerialPorts.value = response;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function subscribe(from: string, to: string) {
    api
      .subscribe(from, to)
      .then((response) => {
        managedSerialPorts.value = response;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function unsubscribe(from: string, to: string) {
    api
      .unsubscribe(from, to)
      .then((response) => {
        managedSerialPorts.value = response;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function toggleReadState(name: string) {
    api
      .toggleReadState(name)
      .then((response) => {
        managedSerialPorts.value = response;
      })
      .catch((error) => {
        console.error("Error toggling read state:", error);
      });
  }

  async function sendToSerialPort(name: string, value: string) {
    await api.sendToSerialPort(name, value).catch((error) => {
      console.error(error);
    });
  }

  async function sendToAllSerialPorts(value: string) {
    await api.sendToAllSerialPorts(value).catch((error) => {
      console.error(error);
    });
  }

  /**
   * Adds a packet to the corresponding port.
   * If the port does not exist, it will be created.
   */

  function addPortData(portName: string, data: string) {
    if (!portData.value[portName]) {
      portData.value[portName] = [];
    }

    portData.value[portName].push(data);
  }

  function addPacket(portName: string, data: PacketData) {
    if (!packets.value[portName]) {
      packets.value[portName] = [];
    }

    packets.value[portName].push(data);
  }

  return {
    managedSerialPorts,
    packets,
    getSerialPorts,
    openSerialPort,
    closeSerialPort,
    subscribe,
    unsubscribe,
    toggleReadState,
    sendToSerialPort,
    sendToAllSerialPorts,
    addPacket,
    addPortData,
    portData,
  };
});
