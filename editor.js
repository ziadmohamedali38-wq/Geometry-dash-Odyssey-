// editor.js
const LevelManager = {
    // Save a custom level to Firebase
    saveLevel: async (levelName, levelData) => {
        try {
            await db.collection("levels").doc(levelName).set({
                blocks: levelData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Level ${levelName} saved successfully!`);
            alert("Level saved to cloud!");
        } catch (error) {
            console.error("Error saving level:", error);
        }
    },

    // Load a custom level from Firebase
    loadLevel: async (levelName) => {
        try {
            const doc = await db.collection("levels").doc(levelName).get();
            if (doc.exists) {
                console.log("Level loaded from cloud!");
                return doc.data().blocks;
            } else {
                console.log("No such level found!");
                return null;
            }
        } catch (error) {
            console.error("Error loading level:", error);
            return null;
        }
    }
};
