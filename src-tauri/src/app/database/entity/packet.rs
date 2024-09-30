//! `SeaORM` Entity, @generated by sea-orm-codegen 1.0.1

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "packet")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub serial_port_id: i32,
    pub tag: String,
    pub timestamp: DateTimeUtc,
    pub incoming: bool,
    pub outgioing: bool,
    pub outgoing_direct: Option<bool>,
    pub outgoing_broadcast: Option<bool>,
    pub outgoing_subscription: Option<String>,
    #[sea_orm(column_type = "Blob")]
    pub data: Vec<u8>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::serial_port::Entity",
        from = "Column::SerialPortId",
        to = "super::serial_port::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    SerialPort,
}

impl Related<super::serial_port::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SerialPort.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}