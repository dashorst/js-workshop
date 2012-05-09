package nl.topicus;

import java.io.Serializable;

import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.markup.html.form.Form;
import org.apache.wicket.markup.html.form.SubmitLink;
import org.apache.wicket.markup.html.form.TextField;
import org.apache.wicket.markup.html.panel.FeedbackPanel;
import org.apache.wicket.model.Model;
import org.apache.wicket.model.PropertyModel;
import org.apache.wicket.request.mapper.parameter.PageParameters;

public class HomePage extends WebPage
{
	private static final long serialVersionUID = 1L;

	public static class Bean implements Serializable
	{
		private static final long serialVersionUID = 1L;

		private String field1;

		private String field2;

		public String getField1()
		{
			return field1;
		}

		public void setField1(String field1)
		{
			this.field1 = field1;
		}

		public String getField2()
		{
			return field2;
		}

		public void setField2(String field2)
		{
			this.field2 = field2;
		}
	}

	public HomePage(final PageParameters parameters)
	{
		super(parameters);

		add(new FeedbackPanel("feedback"));

		Form<Bean> form = new Form<>("form", Model.of(new Bean()));
		add(form);

		form.add(new TextField<>("field1", new PropertyModel<String>(form.getModel(), "field1"))
			.setRequired(true));
		form.add(new TextField<>("field2", new PropertyModel<String>(form.getModel(), "field2")));
		form.add(new SubmitLink("submit", form));
	}
}
