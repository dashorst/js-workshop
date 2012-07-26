package nl.topicus.resource;

import java.util.Arrays;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import nl.topicus.data.Customer;
import nl.topicus.data.Customers;

@Path("/customers")
public class CustomerResource
{
	@GET
	@Produces({"application/json", "application/xml"})
	public Customers getCustomers()
	{
		return new Customers(Arrays.asList(new Customer("jan", "jaap"),
			new Customer("klaas", "jan")));
	}
}
