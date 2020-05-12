package com.samoxive.discordstats.discord

import com.samoxive.discordstats.service.MessageService
import net.dv8tion.jda.api.events.ReadyEvent
import net.dv8tion.jda.api.events.message.guild.GuildMessageDeleteEvent
import net.dv8tion.jda.api.events.message.guild.GuildMessageReceivedEvent
import net.dv8tion.jda.api.hooks.ListenerAdapter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class EventListener(@Autowired val messageService: MessageService) : ListenerAdapter() {
    override fun onReady(event: ReadyEvent) {
        event.jda.guilds.forEach { messageService.populateMessageHistory(it) }
    }

    override fun onGuildMessageReceived(event: GuildMessageReceivedEvent) {
        messageService.insertMessage(event.message)
    }

    override fun onGuildMessageDelete(event: GuildMessageDeleteEvent) {
        messageService.deleteMessage(event.messageIdLong)
    }
}