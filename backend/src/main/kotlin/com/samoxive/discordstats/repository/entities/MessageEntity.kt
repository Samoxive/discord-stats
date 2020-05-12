package com.samoxive.discordstats.repository.entities

import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Index
import javax.persistence.Table

@Entity
@Table(
    name = "messages",
    indexes = [Index(name = "messages_index_1", columnList = "creationTime,guildId,channelId")]
)
class MessageEntity(
    @Id var id: Long,
    var guildId: Long,
    var channelId: Long,
    var userId: Long,
    var messageLength: Int,
    var wordCount: Int,
    var creationTime: Long
)