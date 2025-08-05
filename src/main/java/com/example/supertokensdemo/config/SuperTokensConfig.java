package com.example.supertokensdemo.config;

import io.supertokens.pluginInterface.exceptions.DbInitException;
import io.supertokens.pluginInterface.exceptions.InvalidConfigException;
import io.supertokens.pluginInterface.exceptions.StorageQueryException;
import io.supertokens.pluginInterface.exceptions.StorageTransactionLogicException;
import io.supertokens.storageLayer.StorageLayer;
import io.supertokens.ProcessState;
import io.supertokens.SuperTokens;
import io.supertokens.config.Config;
import io.supertokens.config.CoreConfig;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.IOException;

@Configuration
public class SuperTokensConfig {

    @Value("${supertokens.connectionURI:https://try.supertokens.com}")
    private String connectionURI;

    @Value("${supertokens.apiKeys:}")
    private String apiKeys;

    @PostConstruct
    public void init() throws IOException, InvalidConfigException, DbInitException, 
                             StorageQueryException, StorageTransactionLogicException {
        
        String[] args = new String[]{
            "config.yaml"
        };

        // Initialize SuperTokens
        SuperTokens.init(args, new ProcessState.EventHandler() {
            @Override
            public void beforeShutdown() {
                // Handle any cleanup before shutdown
            }

            @Override
            public void afterStarted() {
                // Handle any setup after SuperTokens has started
                System.out.println("SuperTokens initialized successfully!");
            }
        });

        // Configure the connection URI
        if (connectionURI != null && !connectionURI.isEmpty()) {
            Config.setConfig(new CoreConfig(connectionURI, apiKeys));
        }
    }
}
