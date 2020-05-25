package com.samoxive.discordstats.repository

import com.samoxive.discordstats.repository.entities.MessageEntity
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.math.BigInteger

interface MessageRepository : CrudRepository<MessageEntity, Long> {
    fun findFirstByGuildIdAndAndChannelIdOrderByCreationTimeAsc(guildId: Long, channelId: Long): MessageEntity?
    fun findFirstByGuildIdAndAndChannelIdOrderByCreationTimeDesc(guildId: Long, channelId: Long): MessageEntity?
    fun findByGuildIdAndCreationTimeBetweenOrderByCreationTimeAsc(guildId: Long, creationTimeStart: Long, creationTimeEnd: Long): List<MessageEntity>

    @Query(
        "select channel_id, count(id) from messages where guild_id = ? and creation_time between ? and ? group by channel_id;",
        nativeQuery = true)
    fun findChannelMessageLeaderboard(guildId: Long, creationTimeStart: Long, creationTimeEnd: Long): List<Array<Long>>

    @Query(
        "select user_id, count(id) from messages where guild_id = ? and creation_time between ? and ? group by user_id;",
        nativeQuery = true)
    fun findMemberMessageLeaderboard(guildId: Long, creationTimeStart: Long, creationTimeEnd: Long): List<Array<Long>>

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