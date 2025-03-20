use bytes::Bytes;
use futures::{SinkExt, StreamExt};
use tokio::io::{AsyncRead, AsyncWrite};
use tokio_util::codec::{BytesCodec, FramedRead, FramedWrite};

use crate::serial_manager::{
    error::{SerialManagerAvailablePortsError, SerialManagerOpenPortError},
    model::{SerialManagerOpenSerialPortOptions, SerialManagerPort},
    serial_manager_service::SerialManagerService,
};

#[derive(Debug)]
pub struct DummySerialManager {
    _private: (),
}

impl DummySerialManager {
    pub fn new() -> Self {
        tracing::info!("Creating Dummy Serial Manager");

        Self { _private: () }
    }
}

impl Default for DummySerialManager {
    fn default() -> Self {
        Self::new()
    }
}

impl SerialManagerService for DummySerialManager {
    fn available_ports(&self) -> Result<Vec<SerialManagerPort>, SerialManagerAvailablePortsError> {
        Ok(vec![
            SerialManagerPort::new("DUMMY-1".to_string()),
            SerialManagerPort::new("DUMMY-2".to_string()),
        ])
    }

    /// Returns a port that sends `Hello from async dummy serial! :D\n` every second and echoes back any received data.
    fn open_port<'a>(
        &self,
        _name: impl Into<std::borrow::Cow<'a, str>>,
        _options: SerialManagerOpenSerialPortOptions,
    ) -> Result<impl AsyncRead + AsyncWrite + 'static, SerialManagerOpenPortError> {
        let (port_stream, device_stream) = tokio::io::duplex(1024);

        tokio::spawn(async move {
            let (read, write) = tokio::io::split(device_stream);
            let mut framed_read = FramedRead::new(read, BytesCodec::new());
            let mut framed_write = FramedWrite::new(write, BytesCodec::new());

            let (mut tx, mut rx) = futures::channel::mpsc::channel(1024);

            tokio::spawn(async move {
                loop {
                    tokio::select! {
                        bytes = rx.next() => {
                            match bytes {
                                Some(bytes) => {
                                    if framed_write.send(bytes).await.is_err() {
                                        break;
                                    }
                                }
                                None => {
                                    break;
                                }
                            }
                        },
                        _ = tokio::time::sleep(tokio::time::Duration::from_secs(1)) => {
                            if framed_write.send(Bytes::from(&b"Hello from async dummy serial! :D\n"[..])).await.is_err() {
                                break;
                            }
                        }
                    }
                }
            });

            while let Some(Ok(bytes)) = framed_read.next().await {
                if tx.send(bytes).await.is_err() {
                    break;
                }
            }
        });

        Ok(port_stream)
    }
}
