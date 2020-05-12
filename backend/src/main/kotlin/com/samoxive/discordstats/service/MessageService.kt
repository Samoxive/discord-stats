package com.samoxive.discordstats.service

import com.samoxive.discordstats.repository.MessageRepository
import com.samoxive.discordstats.repository.entities.MessageEntity
import net.dv8tion.jda.api.Permission
import net.dv8tion.jda.api.entities.Guild
import net.dv8tion.jda.api.entities.Message
import net.dv8tion.jda.api.entities.TextChannel
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Component
import java.util.concurrent.Executors
import javax.persistence.EntityExistsException

private fun Message.toEntity() = MessageEntity(
    idLong,
    guild.idLong,
    channel.idLong,
    author.idLong,
    contentRaw.length,
    contentRaw.split(Regex("\\s+")).size,
    timeCreated.toEpochSecond()
)

@Component
class MessageService(@Autowired private val messageRepository: MessageRepository) {
    private val executor = Executors.newFixedThreadPool(8)
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun findOldestMessageInChannel(channel: TextChannel): MessageEntity? {
        return messageRepository.findOldestMessage(channel.guild.idLong, channel.idLong)
    }

    fun findNewestMessageInChannel(channel: TextChannel): MessageEntity? {
        return messageRepository.findNewestMessage(channel.guild.idLong, channel.idLong)
    }

    fun findMessagesBetweenTimes(guild: Guild, startTime: Long, endTime: Long): List<MessageEntity> {
        if (startTime < 0 || endTime < 0) {
            throw IllegalArgumentException("startTime or endTime cannot be negative!")
        }

        if (startTime >= endTime) {
            throw IllegalArgumentException("startTime cannot be further than endTime")
        }

        return messageRepository.findMessagesBetweenTimes(guild.idLong, startTime, endTime)
    }

    fun insertMessage(message: Message) {
        try {
            messageRepository.save(message.toEntity())
        } catch (e: EntityExistsException) {

        }
    }

    fun deleteMessage(messageId: Long) {
        try {
            messageRepository.deleteById(messageId)
        } catch (e: EmptyResultDataAccessException) {

        }
    }

    fun deleteMessages(channel: TextChannel) {
        messageRepository.deleteAllByGuildIdAndChannelId(channel.guild.idLong, channel.idLong)
    }

    fun populateMessageHistory(guild: Guild) {
        val channels = guild.textChannels.filter {
            guild.selfMember.hasPermission(it, Permission.MESSAGE_HISTORY, Permission.MESSAGE_READ)
        }

        for (channel in channels) {
            executor.execute {
                val oldestMessageEntity = findOldestMessageInChannel(channel)
                val newestMessageEntity = findNewestMessageInChannel(channel)

                if (oldestMessageEntity == null || newestMessageEntity == null) { // nothing stored
                    populateMessageHistoryFromScratch(channel)
                } else {
                    val oldestMessage = channel.retrieveMessageById(oldestMessageEntity.id).complete()
                    val newestMessage = channel.retrieveMessageById(newestMessageEntity.id).complete()

                    if (oldestMessage == null || newestMessage == null) {
                        deleteMessages(channel)
                        populateMessageHistoryFromScratch(channel)
                    } else {
                        populateMessageHistoryBeforeMessage(oldestMessage)
                        populateMessageHistoryAfterMessage(newestMessage)
                    }
                }

                logger.error("Populated channel $channel in guild ${channel.guild}")
            }
        }
    }

    fun populateMessageHistoryFromScratch(channel: TextChannel) {
        val latestMessage = channel.history.retrievePast(1).complete().firstOrNull() ?: return
        messageRepository.save(latestMessage.toEntity())
        populateMessageHistoryBeforeMessage(latestMessage)
    }

    fun populateMessageHistoryBeforeMessage(message: Message) {
        var lastFetchedMessage = message
        while (true) {
            val fetchedMessages = message.channel.getHistoryBefore(lastFetchedMessage, 100)
                .complete()
                .retrievedHistory

            messageRepository.saveAll(fetchedMessages.map { it.toEntity() })

            if (fetchedMessages.size < 100) {
                break
            } else {
                lastFetchedMessage = fetchedMessages[99]
            }
        }
    }

    fun populateMessageHistoryAfterMessage(message: Message) {
        var lastFetchedMessage = message
        while (true) {
            val fetchedMessages = message.channel.getHistoryAfter(lastFetchedMessage, 100)
                .complete()
                .retrievedHistory

            messageRepository.saveAll(fetchedMessages.map { it.toEntity() })

            if (fetchedMessages.size < 100) {
                break
            } else {
                lastFetchedMessage = fetchedMessages[99]
            }
        }
    }
}