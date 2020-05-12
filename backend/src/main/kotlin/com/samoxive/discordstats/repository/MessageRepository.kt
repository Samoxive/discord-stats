package com.samoxive.discordstats.repository

import com.samoxive.discordstats.repository.entities.MessageEntity
import org.springframework.data.repository.CrudRepository

interface MessageRepository : CrudRepository<MessageEntity, Long> {
    fun findFirstByGuildIdAndAndChannelIdOrderByCreationTimeAsc(guildId: Long, channelId: Long): MessageEntity?
    fun findFirstByGuildIdAndAndChannelIdOrderByCreationTimeDesc(guildId: Long, channelId: Long): MessageEntity?
    fun findByGuildIdAndCreationTimeBetweenOrderByCreationTimeAsc(guildId: Long, creationTimeStart: Long, creationTimeEnd: Long): List<MessageEntity>

    fun deleteAllByGuildIdAndChannelId(guildId: Long, channelId: Long)

    @JvmDefault
    fun findOldestMessage(guildId: Long, channelId: Long): MessageEntity? =
        findFirstByGuildIdAndAndChannelIdOrderByCreationTimeAsc(guildId, channelId)

    @JvmDefault
    fun findNewestMessage(guildId: Long, channelId: Long): MessageEntity? =
        findFirstByGuildIdAndAndChannelIdOrderByCreationTimeDesc(guildId, channelId)

    @JvmDefault
    fun findMessagesBetweenTimes(guildId: Long, creationTimeStart: Long, creationTimeEnd: Long): List<MessageEntity> =
        findByGuildIdAndCreationTimeBetweenOrderByCreationTimeAsc(guildId, creationTimeStart, creationTimeEnd)
}