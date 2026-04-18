class PropertyClickService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.isCreatingLead = false;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async handlePropertyClick(property) {
    // Only create leads for authenticated users
    const user = await this.getCurrentUser();
    
    if (!user) {
      console.log('User not authenticated - skipping lead creation');
      return;
    }

    // Prevent duplicate lead creation
    if (this.isCreatingLead) {
      return;
    }

    this.isCreatingLead = true;

    try {
      // Check if lead already exists for this property
      const existingLead = await this.checkLeadExists(property.id);
      if (existingLead.exists) {
        console.log('Lead already exists for this property');
        return;
      }

      // Prepare lead data using existing leads table structure
      const leadData = {
        property_id: property.id,
        property_data: {
          name: property.name,
          property_type: property.property_type,
          property_category: property.property_category,
          city: property.city,
          address_line1: property.address_line1,
          price_min: property.price_min,
          price_max: property.price_max,
          price_per_sqft: property.price_per_sqft,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          total_area: property.total_area,
          area_unit: property.area_unit,
          organization_id: property.organization_id,
          assigned_agent_id: property.assigned_agent_id,
          is_featured: property.is_featured
        }
      };

      // Create lead via API
      const response = await fetch('/api/v1/leads/property-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(leadData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Lead created successfully:', result.data.id);
        this.showLeadCreatedNotification();
      } else {
        console.error('Failed to create lead:', result.message);
      }

    } catch (error) {
      console.error('Error creating lead:', error);
      // Silent fail - don't disrupt user experience
    } finally {
      this.isCreatingLead = false;
    }
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch('/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          return { ...userData.data, token };
        }
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  }

  async checkLeadExists(propertyId) {
    try {
      const user = await this.getCurrentUser();
      if (!user) return { exists: false };

      const response = await fetch(`/api/v1/leads/property-click/check/${propertyId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error checking lead existence:', error);
    }
    return { exists: false };
  }

  showLeadCreatedNotification() {
    // Subtle notification - not intrusive
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Property Interest Saved', {
        body: 'We\'ll keep you updated on this property',
        icon: '/favicon.ico'
      });
    }
  }
}

export default new PropertyClickService();
