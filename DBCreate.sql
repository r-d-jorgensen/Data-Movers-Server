-- version 0.1.0
drop database if exists data_movers_db;
create database data_movers_db;
use data_movers_db;

set names utf8mb4;
set character_set_client = utf8mb4;

create table user_type_ENUM (
		user_type_ENUM_id int not null auto_increment,
    user_type varchar(10) not null,
    primary key (user_type_ENUM_id)
)  engine=innodb auto_increment=1 default charset=utf8mb4 collate = utf8mb4_0900_ai_ci;
insert into user_type_ENUM values (default, 'admin');
insert into user_type_ENUM values (default, 'tester');
insert into user_type_ENUM values (default, 'guest');
insert into user_type_ENUM values (default, 'registered');
insert into user_type_ENUM values (default, 'premium');

create table users (
    user_id int not null auto_increment,
    user_type_ENUM_id int not null,
    facebook_id varchar(50),
    username varchar(25) not null,
    user_password varchar(50) not null,
    email varchar(50),
    primary key (user_id),
    foreign key (user_type_ENUM_id) references user_type_ENUM(user_type_ENUM_id)
)  engine=innodb auto_increment=1 default charset=utf8mb4 collate = utf8mb4_0900_ai_ci;