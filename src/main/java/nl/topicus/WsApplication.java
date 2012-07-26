package nl.topicus;

import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.core.Application;

import nl.topicus.resource.CustomerResource;

import org.codehaus.jackson.jaxrs.JacksonJaxbJsonProvider;

public class WsApplication extends Application
{
	@Override
	public Set<Class< ? >> getClasses()
	{
		Set<Class< ? >> ret = new HashSet<>();
		ret.add(JacksonJaxbJsonProvider.class);
		ret.add(CustomerResource.class);
		return ret;
	}
}
