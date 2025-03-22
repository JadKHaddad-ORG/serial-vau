<template>
    <div :class="['min-h-screen', isDarkTheme ? 'dark bg-gray-900' : 'bg-gray-50']">
        <header class="bg-primary text-white shadow-md">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16 items-center">
                    <div class="flex items-center">
                        <v-icon icon="mdi-harddisk" class="mr-2" />
                        <span class="text-xl font-bold">COM Port Manager</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button @click="refreshPorts"
                            class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary-darken hover:bg-primary-lighten transition-colors">
                            <v-icon icon="mdi-refresh" class="mr-2" size="small" />
                            Refresh Ports
                        </button>
                        <button @click="toggleTheme" class="p-2 rounded-full hover:bg-primary-darken transition-colors">
                            <v-icon :icon="isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night'" />
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <!-- Connection Status -->
            <div class="px-4 py-6 sm:px-0">
                <div
                    :class="['overflow-hidden shadow rounded-lg divide-y', isDarkTheme ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200']">
                    <div class="px-4 py-5 sm:px-6">
                        <h3
                            :class="['text-lg leading-6 font-medium flex items-center', isDarkTheme ? 'text-white' : 'text-gray-900']">
                            <v-icon icon="mdi-connection" class="mr-2" />
                            Connection Status
                        </h3>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <div v-if="Object.keys(connectedPorts).length === 0" class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-4 w-4 rounded-full bg-red-500"></div>
                            </div>
                            <div class="ml-3">
                                <h3 :class="['text-sm font-medium', isDarkTheme ? 'text-gray-200' : 'text-gray-900']">
                                    No ports connected
                                </h3>
                            </div>
                        </div>
                        <div v-else>
                            <h3 :class="['text-sm font-medium mb-3', isDarkTheme ? 'text-gray-200' : 'text-gray-900']">
                                {{ Object.keys(connectedPorts).length }} port(s) connected
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div v-for="(port, path) in connectedPorts" :key="path"
                                    :class="['flex items-center p-3 border rounded-md', isDarkTheme ? 'border-gray-700' : 'border-gray-200']">
                                    <div class="flex-shrink-0">
                                        <div class="h-3 w-3 rounded-full" :class="getStatusTypebyPort(path)" />
                                    </div>
                                    <div class="ml-3 flex-1">
                                        <h3
                                            :class="['text-sm font-medium', isDarkTheme ? 'text-gray-200' : 'text-gray-900']">
                                            {{ path }}</h3>
                                        <p :class="['text-xs', isDarkTheme ? 'text-gray-400' : 'text-gray-500']">{{
                                            port.baudRate }} baud</p>
                                    </div>
                                    <button @click="togglePortReadState(path)"
                                        class="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-white-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                        Toggle Read
                                    </button>
                                    <button @click="disconnectPort(path)"
                                        class="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Available Ports -->
            <div class="px-4 py-6 sm:px-0">
                <div
                    :class="['overflow-hidden shadow rounded-lg divide-y', isDarkTheme ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200']">
                    <div class="px-4 py-5 sm:px-6">
                        <h3
                            :class="['text-lg leading-6 font-medium flex items-center', isDarkTheme ? 'text-white' : 'text-gray-900']">
                            <v-icon icon="mdi-usb-port" class="mr-2" />
                            Available Ports
                        </h3>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <div v-if="loading" class="flex justify-center">
                            <v-progress-circular indeterminate color="primary" class="ma-4"></v-progress-circular>
                        </div>
                        <div v-else-if="managedSerialPorts.length === 0"
                            :class="['text-center py-4', isDarkTheme ? 'text-gray-400' : 'text-gray-500']">
                            No COM ports detected
                        </div>
                        <ul v-else :class="['divide-y', isDarkTheme ? 'divide-gray-700' : 'divide-gray-200']">
                            <li v-for="port in managedSerialPorts" :key="port.name" class="py-4 flex justify-between">
                                <div class="flex items-center">
                                    <v-icon icon="mdi-usb" :class="[isDarkTheme ? 'text-gray-400' : 'text-gray-500']"
                                        class="mr-3" />
                                    <div>
                                        <p
                                            :class="['text-sm font-medium', isDarkTheme ? 'text-gray-200' : 'text-gray-900']">
                                            {{ port.name }}</p>
                                        <p :class="['text-xs', isDarkTheme ? 'text-gray-400' : 'text-gray-500']">{{
                                            port.subscribedTo.length }} subscriptions</p>
                                    </div>
                                </div>
                                <div>
                                    <button @click="connectToPort(port.name, port.lastUsedOpenOptions)"
                                        :disabled="connectedPorts[port.name] ? true : false" :class="[
                                            'inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2',
                                            connectedPorts[port.name]
                                                ? 'bg-green-600 cursor-default'
                                                : 'bg-primary hover:bg-primary-darken focus:ring-primary'
                                        ]">
                                        {{ connectedPorts[port.name] ? 'Connected' : 'Connect' }}
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Data Monitor -->
            <div v-if="Object.keys(connectedPorts).length > 0" class="px-4 py-6 sm:px-0">
                <div
                    :class="['overflow-hidden shadow rounded-lg divide-y', isDarkTheme ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200']">
                    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div class="flex items-center">
                            <h3
                                :class="['text-lg leading-6 font-medium flex items-center', isDarkTheme ? 'text-white' : 'text-gray-900']">
                                <v-icon icon="mdi-monitor" class="mr-2" />
                                Data Monitor
                            </h3>
                            <v-select v-model="selectedPortForMonitor" :items="monitorPortItems" variant="underlined"
                                density="compact" hide-details class="ml-4 max-w-[200px]"></v-select>
                        </div>
                        <div class="flex space-x-2">
                            <button @click="clearData" :class="['inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2',
                                isDarkTheme
                                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
                                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500'
                            ]">
                                <v-icon icon="mdi-delete" size="small" class="mr-1" />
                                Clear
                            </button>
                            <button @click="toggleAutoScroll" :class="[
                                'inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2',
                                autoScroll
                                    ? 'border-primary-lighten text-primary bg-primary-lighten/20 hover:bg-primary-lighten/30 focus:ring-primary'
                                    : isDarkTheme
                                        ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
                                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500'
                            ]">
                                <v-icon icon="mdi-arrow-down-bold-box" size="small" class="mr-1" />
                                Auto-scroll: {{ autoScroll ? 'ON' : 'OFF' }}
                            </button>
                        </div>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <div class="flex mb-4">
                            <v-select v-model="selectedPortForSending" :items="sendPortItems" label="Select port"
                                density="compact" class="mr-2 max-w-[200px]"></v-select>
                            <div class="flex-1 relative">
                                <input v-model="sendData" type="text" :class="[
                                    'w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                                    isDarkTheme
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                ]" placeholder="Enter data to send..." @keyup.enter="sendDataToPort" />
                                <button @click="sendDataToPort" :disabled="!selectedPortForSending || !sendData.trim()"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-darken disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                    <v-icon class="mb-6" icon="mdi-send" />
                                </button>
                            </div>
                        </div>
                        <div ref="dataMonitor"
                            class="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-md h-64 overflow-y-auto">
                            <div v-for="(line, index) in filteredData" :key="index" class="whitespace-pre-wrap">
                                <span>{{ line }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Port Configuration -->
            <div v-if="Object.keys(connectedPorts).length > 0" class="px-4 py-6 sm:px-0">
                <div
                    :class="['overflow-hidden shadow rounded-lg divide-y', isDarkTheme ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200']">
                    <div class="px-4 py-5 sm:px-6 flex items-center">
                        <h3
                            :class="['text-lg leading-6 font-medium flex items-center', isDarkTheme ? 'text-white' : 'text-gray-900']">
                            <v-icon icon="mdi-cog" class="mr-2" />
                            Port Configuration
                        </h3>
                        <v-select v-model="selectedPortForConfig" :items="configPortItems" variant="underlined"
                            density="compact" hide-details class="ml-4 max-w-[200px]"></v-select>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4">
                            <div>
                                <label
                                    :class="['block text-sm font-medium mb-1', isDarkTheme ? 'text-gray-300' : 'text-gray-700']">Baud
                                    Rate</label>
                                <v-select v-model="portConfig.baudRate" :items="baudRates" density="compact"
                                    :bg-color="isDarkTheme ? 'grey-darken-3' : 'white'"></v-select>
                            </div>
                            <div>
                                <label
                                    :class="['block text-sm font-medium mb-1', isDarkTheme ? 'text-gray-300' : 'text-gray-700']">Data
                                    Bits</label>
                                <v-select v-model="portConfig.dataBits"
                                    :items="[DataBits.Eight, DataBits.Five, DataBits.Seven, DataBits.Six]"
                                    density="compact" :bg-color="isDarkTheme ? 'grey-darken-3' : 'white'"></v-select>
                            </div>
                            <div>
                                <label
                                    :class="['block text-sm font-medium mb-1', isDarkTheme ? 'text-gray-300' : 'text-gray-700']">Stop
                                    Bits</label>
                                <v-select v-model="portConfig.stopBits" :items="[StopBits.One, StopBits.Two]"
                                    density="compact" :bg-color="isDarkTheme ? 'grey-darken-3' : 'white'"></v-select>
                            </div>
                            <div>
                                <label
                                    :class="['block text-sm font-medium mb-1', isDarkTheme ? 'text-gray-300' : 'text-gray-700']">Parity</label>
                                <v-select v-model="portConfig.parity" :items="[
                                    { title: 'None', value: 'none' },
                                    { title: 'Even', value: 'even' },
                                    { title: 'Odd', value: 'odd' },
                                    { title: 'Mark', value: 'mark' },
                                    { title: 'Space', value: 'space' }
                                ]" item-title="title" item-value="value" density="compact"
                                    :bg-color="isDarkTheme ? 'grey-darken-3' : 'white'"></v-select>
                            </div>
                        </div>
                        <button @click="applyPortConfig" :disabled="!selectedPortForConfig"
                            class="mt-5 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-darken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                            <v-icon icon="mdi-check" size="small" class="mr-2" />
                            Apply Configuration
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useTheme } from 'vuetify';

import { getSerialPorts, openSerialPort } from '@/api/api';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app';
import { DataBits, FlowControl, OpenSerialPortOptions, Parity, StopBits } from '@/models/open-options';
import { ReadState, StatusType } from '@/models/managed-serial-port';


const app = useAppStore();

const { portData, managedSerialPorts } = storeToRefs(app)
const { addPortData } = app

// Vuetify theme
const theme = useTheme();
const isDarkTheme = ref(theme.global.current.value.dark);

const toggleTheme = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
    isDarkTheme.value = !isDarkTheme.value;
};

// State

const connectedPorts = ref<Record<string, OpenSerialPortOptions>>({});
const loading = ref(false);


const sendData = ref<string>('');
const autoScroll = ref<boolean>(true);
const dataMonitor = ref<{ scrollTop: number, scrollHeight: number } | null>(null);
const selectedPortForMonitor = ref('all');
const selectedPortForSending = ref('');
const selectedPortForConfig = ref('');
const portConfig = ref<OpenSerialPortOptions>({
    baudRate: 115200,
    dataBits: DataBits.Eight,
    stopBits: StopBits.One,
    parity: Parity.None,
    flowControl: FlowControl.Hardware,
    initialReadState: ReadState.Read,
    tag: '',
    timeout: {
        nanos: 0,
        secs: 0,
    },
});

// Constants
const baudRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];

// Computed
const monitorPortItems = computed(() => {
    const items = [{ title: 'All Ports', value: 'all' }];
    for (const path in connectedPorts.value) {
        items.push({ title: path, value: path });
    }
    return items;
});

const sendPortItems = computed(() => {
    const items = [];
    for (const path in connectedPorts.value) {
        items.push({ title: path, value: path });
    }
    return items;
});

const configPortItems = computed(() => {
    const items = [];
    for (const path in connectedPorts.value) {
        items.push({ title: path, value: path });
    }
    return items;
});

const filteredData = computed<string[]>(() => {
    if (selectedPortForMonitor.value === 'all') {
        // Flatten all port data into a single array
        const allData: string[] = [];
        for (const path in portData.value) {
            portData.value[path].forEach(line => {
                allData.push(`[${path}] ${line}`);
            });
        }
        // Sort by the timestamp that would be embedded in the data in a real app
        return allData;
    } else {
        // Return data only for the selected port
        return (portData.value[selectedPortForMonitor.value] || []).map(
            line => `[${selectedPortForMonitor.value}]${line}`
        );
    }
});

// Methods
const refreshPorts = async () => {
    loading.value = true;
    try {
        // In a real application, you would use the Web Serial API or a backend service
        // to get the available ports. For this demo, we'll simulate it.

        getSerialPorts().then(ports => {
            managedSerialPorts.value = ports;
        });

        managedSerialPorts.value.forEach(port => {
            if (port.status.type === StatusType.Open) {

                connectedPorts.value[port.name] = port.lastUsedOpenOptions
            }
        });



    } catch (error: unknown) {
        console.error('Error refreshing ports:', error);
        addPortData('system', `Error: ${(error as Record<string, string>).message}`);
    } finally {
        loading.value = false;
    }
};

const connectToPort = async (portPath: string, options: OpenSerialPortOptions) => {
    try {
        // In a real application, you would use the Web Serial API or a backend service
        // to connect to the port. For this demo, we'll simulate it.

        connectedPorts.value[portPath] = options

        managedSerialPorts.value = await openSerialPort(portPath, options);

        // Initialize port data array if it doesn't exist
        if (!portData.value[portPath]) {
            portData.value[portPath] = [];
        }

        // Store port configuration
        connectedPorts.value[portPath] = options

        // Set as selected port if it's the first one
        if (Object.keys(connectedPorts.value).length === 1) {
            selectedPortForSending.value = portPath;
            selectedPortForConfig.value = portPath;
        }

        // Add connection messages
        addPortData(portPath, `Connected to ${portPath}`);
        addPortData(portPath, `Baud rate: ${portConfig.value.baudRate}`);
        addPortData(portPath, `Data bits: ${portConfig.value.dataBits}`);
        addPortData(portPath, `Stop bits: ${portConfig.value.stopBits}`);
        addPortData(portPath, `Parity: ${portConfig.value.parity}`);
        addPortData(portPath, 'Waiting for data...');
    } catch (error: unknown) {
        console.error('Error connecting to port:', error);
        addPortData(portPath, `Error:  ${(error as Record<string, string>).message}`);
    }
};

const togglePortReadState = async (portPath: string) => {
    if (!connectedPorts.value[portPath]) return;

    await app.toggleReadState(portPath);
};

const getStatusTypebyPort = (path: string): string => {

    const status = managedSerialPorts.value.find(port => port.name === path)?.status

    switch (status?.type) {
        case StatusType.Open:

            switch (status.content.readState) {
                case ReadState.Read:
                    return 'bg-green-500';
                case ReadState.Stop:
                    return 'bg-yellow-500';
            }
        case StatusType.Closed:
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
};


const disconnectPort = async (portPath: string) => {
    try {
        // In a real application, you would use the Web Serial API or a backend service
        // to disconnect from the port. For this demo, we'll simulate it.
        await app.closeSerialPort(portPath)

        addPortData(portPath, `Disconnected from ${portPath}`);

        // Remove port from connected ports
        const { [portPath]: _, ...rest } = connectedPorts.value;
        connectedPorts.value = rest;

        // Update selected ports if needed
        if (selectedPortForSending.value === portPath) {
            selectedPortForSending.value = Object.keys(connectedPorts.value)[0] || '';
        }

        if (selectedPortForConfig.value === portPath) {
            selectedPortForConfig.value = Object.keys(connectedPorts.value)[0] || '';
        }

        if (selectedPortForMonitor.value === portPath) {
            selectedPortForMonitor.value = 'all';
        }
    } catch (error) {
        console.error('Error disconnecting from port:', error);
        addPortData(portPath, `Error: ${(error as Record<string, string>).message}`);
    }
};

const sendDataToPort = async () => {
    if (!sendData.value.trim() || !selectedPortForSending.value) return;

    const portPath = selectedPortForSending.value;

    try {

        await app.sendToSerialPort(portPath, sendData.value)

        // In a real application, you would use the Web Serial API or a backend service
        // to send data to the port. For this demo, we'll simulate it.

        // Simulate a response
        setTimeout(() => {
            scrollToBottom();
        }, 300);

        sendData.value = '';
    } catch (error) {
        console.error('Error sending data:', error);
        addPortData(portPath, `Error: ${(error as Record<string, string>).message}`);
    }
};

const clearData = () => {
    if (selectedPortForMonitor.value === 'all') {
        // Clear all port data
        portData.value = {};
        for (const path in connectedPorts.value) {
            portData.value[path] = [];
        }
    } else {
        // Clear only the selected port data
        portData.value[selectedPortForMonitor.value] = [];
    }
};

const toggleAutoScroll = () => {
    autoScroll.value = !autoScroll.value;
};

const scrollToBottom = () => {
    if (autoScroll.value && dataMonitor.value) {
        nextTick(() => {
            if (dataMonitor.value) {
                dataMonitor.value.scrollTop = dataMonitor.value.scrollHeight;
            }
        });
    }
};

const applyPortConfig = () => {
    if (!selectedPortForConfig.value) return;

    const portPath = selectedPortForConfig.value;

    // Update port configuration
    connectedPorts.value[portPath] = portConfig.value

    addPortData(portPath, 'Applying new configuration:');
    addPortData(portPath, `Baud rate: ${portConfig.value.baudRate}`);
    addPortData(portPath, `Data bits: ${portConfig.value.dataBits}`);
    addPortData(portPath, `Stop bits: ${portConfig.value.stopBits}`);
    addPortData(portPath, `Parity: ${portConfig.value.parity}`);
    scrollToBottom();
};



// Lifecycle hooks
onMounted(() => {
    refreshPorts();
});

watch(portData, () => {
    if (autoScroll.value) {
        scrollToBottom();
    }
}, { deep: true });


// Watchers
watch(connectedPorts, (newVal) => {
    // If there are no connected ports, reset the port data
    if (Object.keys(newVal).length === 0) {
        portData.value = {};
    }
}, { deep: true });
</script>

<style scoped>
/* Custom classes for Tailwind with Vuetify theme integration */
.bg-primary {
    background-color: rgb(var(--v-theme-primary));
}

.bg-primary-lighten {
    background-color: color-mix(in srgb, rgb(var(--v-theme-primary)) 80%, white);
}

.bg-primary-darken {
    background-color: color-mix(in srgb, rgb(var(--v-theme-primary)) 80%, black);
}

.text-primary {
    color: rgb(var(--v-theme-primary));
}

.border-primary {
    border-color: rgb(var(--v-theme-primary));
}

.hover\:bg-primary-lighten:hover {
    background-color: color-mix(in srgb, rgb(var(--v-theme-primary)) 80%, white);
}

.hover\:bg-primary-darken:hover {
    background-color: color-mix(in srgb, rgb(var(--v-theme-primary)) 80%, black);
}

.hover\:text-primary-darken:hover {
    color: color-mix(in srgb, rgb(var(--v-theme-primary)) 80%, black);
}

.focus\:ring-primary:focus {
    --tw-ring-color: rgb(var(--v-theme-primary));
}

.focus\:border-primary:focus {
    border-color: rgb(var(--v-theme-primary));
}

/* Dark mode styles */
.dark .dark\:bg-gray-800 {
    background-color: #1e1e1e;
}

.dark .dark\:bg-gray-700 {
    background-color: #2d2d2d;
}

.dark .dark\:text-white {
    color: #ffffff;
}

.dark .dark\:text-gray-300 {
    color: #d1d5db;
}

.dark .dark\:text-gray-400 {
    color: #9ca3af;
}

.dark .dark\:border-gray-700 {
    border-color: #374151;
}

.dark .dark\:divide-gray-700 {
    border-color: #374151;
}

/* Terminal styles */
.font-mono {
    font-family: 'Courier New', Courier, monospace;
}
</style>