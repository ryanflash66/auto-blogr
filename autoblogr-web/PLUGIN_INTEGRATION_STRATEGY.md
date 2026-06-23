# AutoBlogr Plugin Integration Strategy

_Generated: August 21, 2025_

## 📋 **Current State**

- **Frontend**: Fully functional React app with mock AI integrations
- **Plugin**: In development (separate codebase)
- **Integration**: Mock functions in `@/integrations/Core.js`
- **Status**: Development phase with simulated responses

---

## 🏗️ **Recommended Architecture**

### **Keep Plugin Separate** ✅

```
autoblogr-ecosystem/
├── autoblogr-web/          # Current React frontend
│   ├── src/
│   ├── @/integrations/     # Mock platform integrations
│   └── package.json
│
├── autoblogr-plugin/       # Your plugin codebase
│   ├── src/
│   ├── manifest.json
│   └── package.json
│
└── autoblogr-backend/      # Future: Real platform/API
    ├── api/
    └── integrations/
```

---

## 🔄 **Integration Phases**

### **Phase 1: Development (Current)**

```javascript
// @/integrations/Core.js - Current mock implementation
export const InvokeLLM = async (prompt, options = {}) => {
  console.warn("InvokeLLM: Mock implementation");

  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  return {
    content: `Mock AI response for prompt: "${prompt.substring(0, 50)}..."`,
    usage: { tokens: Math.floor(100 + Math.random() * 200), cost: 0.002 },
    model: "gpt-4-mock",
  };
};

export const GenerateImage = async (prompt, options = {}) => {
  console.warn("GenerateImage: Mock implementation");

  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  const imagePrompt = encodeURIComponent(prompt.substring(0, 20));
  return {
    url: `https://via.placeholder.com/800x400/059669/ffffff?text=${imagePrompt}`,
    filename: `generated-${Date.now()}.png`,
    prompt: prompt,
  };
};
```

### **Phase 2: Plugin Integration**

```javascript
// @/integrations/Core.js - Plugin integration
export const InvokeLLM = async (prompt, options = {}) => {
  // Check if plugin is available
  if (window.autoblogrPlugin?.available) {
    console.log("Using AutoBlogr plugin for text generation");
    return await window.autoblogrPlugin.generateText(prompt, options);
  }

  // Check if backend API is available
  if (window.autoblogrAPI?.available) {
    console.log("Using AutoBlogr platform API");
    return await window.autoblogrAPI.invokeAI(prompt, options);
  }

  // Fallback to mock for development
  console.warn("Falling back to mock implementation");
  return await mockInvokeLLM(prompt, options);
};

export const GenerateImage = async (prompt, options = {}) => {
  if (window.autoblogrPlugin?.available) {
    return await window.autoblogrPlugin.generateImage(prompt, options);
  }

  if (window.autoblogrAPI?.available) {
    return await window.autoblogrAPI.generateImage(prompt, options);
  }

  return await mockGenerateImage(prompt, options);
};
```

### **Phase 3: Production Integration**

```javascript
// @/integrations/Core.js - Production-ready
export const InvokeLLM = async (prompt, options = {}) => {
  const integrationOrder = [
    "plugin", // Preferred: Local plugin
    "platform", // Backup: Platform API
    "direct", // Fallback: Direct API calls
  ];

  for (const integration of integrationOrder) {
    try {
      switch (integration) {
        case "plugin":
          if (await checkPluginAvailability()) {
            return await window.autoblogrPlugin.generateText(prompt, options);
          }
          break;

        case "platform":
          if (await checkPlatformAPI()) {
            return await platformAPI.invokeAI(prompt, options);
          }
          break;

        case "direct":
          return await directOpenAICall(prompt, options);
      }
    } catch (error) {
      console.warn(`${integration} integration failed:`, error);
      continue;
    }
  }

  throw new Error("All AI integration methods failed");
};
```

---

## 🔌 **Plugin Interface Contract**

### **Required Plugin Interface**

```javascript
// Expected plugin interface that web app will look for
window.autoblogrPlugin = {
  // Plugin availability and status
  available: boolean,
  version: string,
  status: 'connected' | 'disconnected' | 'error',

  // Core AI functions
  generateText: (prompt, options) => Promise<{
    content: string,
    usage: { tokens: number, cost: number },
    model: string,
    timestamp: string
  }>,

  generateImage: (prompt, options) => Promise<{
    url: string,
    filename: string,
    width: number,
    height: number,
    prompt: string
  }>,

  // Plugin management
  getStatus: () => Promise<{
    connected: boolean,
    model: string,
    tokensRemaining: number,
    lastError?: string
  }>,

  // Configuration
  configure: (settings) => Promise<boolean>,
  getConfig: () => Promise<object>,

  // Events
  onStatusChange: (callback) => void,
  onError: (callback) => void
};
```

### **Plugin Detection Strategy**

```javascript
// @/utils/pluginDetection.js
export const detectPlugin = async () => {
  return new Promise((resolve) => {
    // Check immediately
    if (window.autoblogrPlugin?.available) {
      resolve(true);
      return;
    }

    // Wait for plugin to load (up to 5 seconds)
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;

      if (window.autoblogrPlugin?.available) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (attempts > 50) {
        // 5 seconds
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
};

export const getPluginStatus = () => {
  if (!window.autoblogrPlugin) {
    return { available: false, status: "not_installed" };
  }

  return {
    available: window.autoblogrPlugin.available,
    version: window.autoblogrPlugin.version,
    status: window.autoblogrPlugin.status,
  };
};
```

---

## 🎯 **UI Integration Points**

### **1. Plugin Status Component**

```javascript
// @/components/PluginStatus.jsx
const PluginStatus = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      const pluginStatus = await getPluginStatus();
      setStatus(pluginStatus);
    };

    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="plugin-status">
      {status?.available ? (
        <Badge className="bg-green-100 text-green-800">
          Plugin Connected v{status.version}
        </Badge>
      ) : (
        <Badge className="bg-yellow-100 text-yellow-800">
          Using Platform API
        </Badge>
      )}
    </div>
  );
};
```

### **2. LLM Test Page Integration**

```javascript
// Update LLMTest.js to show integration source
const [integrationSource, setIntegrationSource] = useState("mock");

const handleTextGeneration = async () => {
  // ... existing code ...

  // Detect which integration was used
  if (window.autoblogrPlugin?.available) {
    setIntegrationSource("plugin");
  } else if (window.autoblogrAPI?.available) {
    setIntegrationSource("platform");
  } else {
    setIntegrationSource("mock");
  }
};
```

### **3. Settings Integration**

```javascript
// Add to Profile.js
const [pluginSettings, setPluginSettings] = useState({
  enabled: true,
  fallbackToPlatform: true,
  preferredModel: "gpt-4",
});

const savePluginSettings = async () => {
  if (window.autoblogrPlugin?.configure) {
    await window.autoblogrPlugin.configure(pluginSettings);
  }
};
```

---

## ✅ **Benefits of This Strategy**

### **Development Benefits**

- ✅ **Independent Development**: Plugin and web app evolve separately
- ✅ **Testing Isolation**: Each component can be tested independently
- ✅ **Clean Architecture**: Clear separation of concerns
- ✅ **Version Control**: Separate git repositories and release cycles

### **User Benefits**

- ✅ **Graceful Degradation**: App works with or without plugin
- ✅ **Flexibility**: Users can choose integration method
- ✅ **Reliability**: Multiple fallback options
- ✅ **Performance**: Local plugin is faster than API calls

### **Business Benefits**

- ✅ **Distribution Flexibility**: Plugin can be distributed separately
- ✅ **Monetization Options**: Different pricing for plugin vs platform
- ✅ **Market Reach**: Plugin works with other tools too
- ✅ **Risk Mitigation**: Not dependent on single integration method

---

## 📝 **Implementation Checklist**

### **When Plugin is Ready:**

- [ ] Update `@/integrations/Core.js` with plugin detection
- [ ] Add plugin status component to UI
- [ ] Update LLM Test page to show integration source
- [ ] Add plugin settings to Profile page
- [ ] Create plugin detection utilities
- [ ] Add error handling for plugin failures
- [ ] Update documentation with plugin setup instructions
- [ ] Test fallback scenarios thoroughly

### **Future Enhancements:**

- [ ] Plugin auto-update mechanism
- [ ] Plugin marketplace integration
- [ ] Advanced plugin configuration UI
- [ ] Plugin usage analytics
- [ ] Multi-plugin support

---

## 🔮 **Future Considerations**

### **Plugin Ecosystem**

- Support for multiple AI provider plugins
- Plugin store/marketplace
- Third-party plugin development SDK
- Plugin sandboxing and security

### **Advanced Integration**

- Plugin performance monitoring
- Automatic failover between integrations
- Load balancing across multiple sources
- Caching layer for improved performance

---

**Notes**: This strategy allows for smooth transition from mock → plugin → production while maintaining a functional application at every stage. The plugin remains independent but integrates seamlessly when available.
