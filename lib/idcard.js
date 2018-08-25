/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const JSZip = require('jszip');

const CONNECTION_FILE_JSON = 'connection.json';
const METADATA_FILENAME = 'metadata.json';
const CREDENTIALS_DIRNAME = 'credentials';

const CURRENT_VERSION = 1;

/**
 * Business Network Card. Encapsulates credentials and other information required to connect to a specific business network
 * as a specific user.
 *
 * Instances of this class can be created using IdCard.fromArchive or IdCard.fromDirectory, as well as the constructor.
 *
 */
class IdCard {

    /**
     * Create the IdCard.
     * @param {Object} metadata - metadata associated with the card.
     * @param {Object} connectionProfile - connection profile associated with the card.
     */
    constructor(metadata, connectionProfile) {
        const method = 'constructor';

        if (!metadata) {
            throw new Error('Missing metadata');
        }

        if (metadata.version || metadata.version === 0) {
            // Migrate earlier versions using fall-through logic to migrate in single version steps
            switch (metadata.version) {
            case 0:
                metadata.userName = metadata.enrollmentId;
                delete metadata.enrollmentId;
                delete metadata.name;
                metadata.version = 1;
            }

            if (metadata.version !== CURRENT_VERSION) {
                throw new Error(`Incompatible card version ${metadata.version}. Current version is ${CURRENT_VERSION}`);
            }
        } else {
            metadata.version = CURRENT_VERSION;
        }

        if (!metadata.userName) {
            throw new Error('Required metadata field not found: userName');
        }
        if (!(connectionProfile && connectionProfile.name)) {
            throw new Error('Required connection field not found: name');
        }
        this.metadata = metadata;
        this.connectionProfile = connectionProfile;
        this.credentials = { };
    }

    /**
     * Name of the user identity associated with the card. This should be unique within the scope of a given
     * business network and connection profile.
     *
     * This is a mandatory field.
     * @return {String} Name of the user identity.
     */
    getUserName() {
        return this.metadata.userName;
    }

    /**
     * Free text description of the card.
     * @return {String} card description.
     */
    getDescription() {
        return this.metadata.description || '';
    }

    /**
     * Name of the business network to which the ID card applies. Generally this will be present but may be
     * omitted for system cards.
     * @return {String} business network name.
     */
    getBusinessNetworkName() {
        return this.metadata.businessNetwork || '';
    }

    /**
     * Connection profile for this card.
     *
     * This is a mandatory field.
     * @return {Object} connection profile.
     */
    getConnectionProfile() {
        let newprofile = Object.assign({}, this.connectionProfile);
        delete newprofile.wallet;
        return newprofile;
    }

    /**
     * Credentials associated with this card, and which are used to connect to the associated business network.
     * <p>
     * For PKI-based authentication, the credentials are expected to be of the form:
     * <em>{ certificate: String, privateKey: String }</em>.
     * @return {Object} credentials.
     */
    getCredentials() {
        return this.credentials;
    }

    /**
     * Credentials to associate with this card.
     * <p>
     * For PKI-based authentication, the credentials are expected to be of the form:
     * <em>{ certificate: String, privateKey: String }</em>.
     * @param {Object} credentials credentials.
     */
    setCredentials(credentials) {
        const method = 'setCredentials';

        this.credentials = credentials || { };

    }

    /**
     * Enrollment credentials. If there are no credentials associated with this card, these credentials  are used to
     * enroll with a business network and obtain certificates.
     * <p>
     * For an ID/secret enrollment scheme, the credentials are expected to be of the form:
     * <em>{ secret: String }</em>.
     * @return {Object} enrollment credentials, or null if none exist.
     */
    getEnrollmentCredentials() {
        const secret = this.metadata.enrollmentSecret;
        return secret ? { secret : secret } : null;
    }

    /**
     * Special roles for which this ID can be used, which can include:
     * <ul>
     *   <li>PeerAdmin</li>
     *   <li>ChannelAdmin</li>
     *   <li>Issuer</li>
     * </ul>
     * @return {String[]} roles.
     */
    getRoles() {
        return this.metadata.roles || [ ];
    }

    /**
     * Create an IdCard from a card archive.
     * <p>
     * Valid types for <em>zipData</em> are any of the types supported by JSZip.
     * @param {String|ArrayBuffer|Uint8Array|Buffer|Blob|Promise} zipData - card archive data.
     * @return {Promise} Promise to the instantiated IdCard.
     */
    static fromArchive(zipData) {
        const method = 'fromArchive';

        return JSZip.loadAsync(zipData).then((zip) => {
            let promise = Promise.resolve();

            let metadata;
            let connection;
            let credentials = { };

            let connectionFile = zip.file(CONNECTION_FILE_JSON);
            if (!connectionFile) {
                throw Error('Required file not found: ' + CONNECTION_FILE_JSON);
            }

            promise = promise.then(() => {
                return connectionFile.async('string');
            }).then((connectionContent) => {
                connection = JSON.parse(connectionContent);
            });

            const metadataFile = zip.file(METADATA_FILENAME);
            if (!metadataFile) {
                throw Error('Required file not found: ' + METADATA_FILENAME);
            }

            promise = promise.then(() => {
                return metadataFile.async('string');
            }).then((metadataContent) => {
                metadata = JSON.parse(metadataContent);
                // First cut of ID cards did not have a version so call them version zero
                if (!metadata.version) {
                    metadata.version = 0;
                }
            });

            const loadDirectoryToObject = function(directoryName, obj) {
                // Incude '/' following directory name
                const fileIndex = directoryName.length + 1;
                // Find all files that are direct children of specified directory
                const files = zip.file(new RegExp(`^${directoryName}/[^/]+$`));
                files && files.forEach((file) => {
                    promise = promise.then(() => {
                        return file.async('string');
                    }).then((content) => {
                        const filename = file.name.slice(fileIndex);
                        obj[filename] = content;
                    });
                });
            };

            loadDirectoryToObject(CREDENTIALS_DIRNAME, credentials);

            return promise.then(() => {
                const idCard = new IdCard(metadata, connection);
                idCard.setCredentials(credentials);
                return idCard;
            });
        });
    }
}

module.exports = IdCard;
