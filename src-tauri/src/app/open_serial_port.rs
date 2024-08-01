use tokio::sync::mpsc::{error::SendError as TokioSendError, Sender};
use tokio_util::sync::CancellationToken;

use crate::serial::SerialPort;

#[derive(Debug)]
pub struct OpenSerialPort {
    serial_port: SerialPort,
    tx: Sender<String>,
    cancellation_token: CancellationToken,
}

impl OpenSerialPort {
    pub fn new(
        serial_port: SerialPort,
        tx: Sender<String>,
        cancellation_token: CancellationToken,
    ) -> Self {
        Self {
            serial_port,
            tx,
            cancellation_token,
        }
    }

    pub fn name(&self) -> &str {
        &self.serial_port.name()
    }

    fn cancel(&self) {
        tracing::debug!(name=%self.name(), "Cancelling");

        self.cancellation_token.cancel()
    }

    // TODO: make private to state. Port should only be cancelled on removal.
    pub fn cancelled(self) -> Self {
        self.cancel();
        self
    }

    pub async fn send(&self, value: String) -> Result<(), SendError> {
        Ok(self.tx.send(value).await?)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum SendError {
    #[error("Failed to send: {0}")]
    Send(
        #[source]
        #[from]
        TokioSendError<String>,
    ),
}
