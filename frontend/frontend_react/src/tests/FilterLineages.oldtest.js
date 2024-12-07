// this was a test for an older versio of the FilterLineages dropdown menu
// although no longer relevant, it could be a refernce on how to test React features such as "MouseOver" "MouseLeave" "TextInput" 
import { FilterLineages } from "../components/FilterComponents/FilterLineages/FilterLineages";
import _g_lineage_trie from "./test_data/lineage_trie.json";
import { render,screen, fireEvent,waitFor} from "@testing-library/react";
import { GlobalFilterContext } from "../GlobalFilterContext";
import { GlobalDataContext } from "../GlobalDataContext";
import userEvent from "@testing-library/user-event";

describe("TESTSUITE: Mouse Hover FilterLineages" , () =>{
    beforeEach(()=>{
        render(
            <GlobalDataContext.Provider value = {{_g_lineage_trie : _g_lineage_trie,}}>
                <GlobalFilterContext.Provider value = {{setFilter__lineages:()=>{}}}>
                    <FilterLineages/>
                </GlobalFilterContext.Provider>
            </GlobalDataContext.Provider>
        );
    })
    test("TEST: Toggle display mainMenu with mouseOver/mouseLeave", async()=>{
        const lineageInput = screen.getByPlaceholderText("lineage");
        const mainMenu = screen.getByTestId("dropdown-root");
        expect(mainMenu).not.toBeVisible();
        
        userEvent.hover(lineageInput);
        expect(mainMenu).toBeVisible();
        userEvent.unhover(lineageInput);
        waitFor(()=>{expect(mainMenu).not.toBeVisible();},{timeout:250})

    })

    test("TEST: Toggle display subMenu B.1 upon mouseHover/mouseLeave B->B.1", async()=>{
        const lineageInput = screen.getByPlaceholderText("lineage");
        const menuItem_B = screen.getByTestId("menuItem-B");
        const menuItem_B_1 = screen.getByTestId("menuItem-B.1");
        expect(menuItem_B).not.toBeVisible();
        expect(menuItem_B_1).not.toBeVisible();
        userEvent.hover(lineageInput);
        expect(menuItem_B).toBeVisible();
        expect(menuItem_B_1).not.toBeVisible();
        userEvent.hover(menuItem_B);
        waitFor(()=>{expect(menuItem_B_1).not.toBeVisible();},{timeout:250})
    })
})

describe("TESTSUITE: Text Input FilterLineages", ()=>{
    beforeEach(()=>{
        render(
            <GlobalDataContext.Provider value = {{_g_lineage_trie : _g_lineage_trie,}}>
                <GlobalFilterContext.Provider value = {{setFilter__lineages:()=>{}}}>
                    <FilterLineages/>
                </GlobalFilterContext.Provider>
            </GlobalDataContext.Provider>
        );
    })
    
    test("TEST: toggle display menuRoot with {esc}/{return} key", async ()=>{
        const lineageInput = screen.getByPlaceholderText("lineage");
        const menuRoot = screen.getByTestId("dropdown-root");
        expect(menuRoot).not.toBeVisible();

        // show the dropdown by pressing {enter} key
        userEvent.click(lineageInput);
        userEvent.type(lineageInput,"{enter}");
        expect(menuRoot).toBeVisible();
        const expectedChildValues = Object.values(_g_lineage_trie.root.children).map(e=>e.value)
        expectedChildValues.forEach(e=>expect(menuRoot.textContent).toContain(e))
        
        //hide the dropdown by pressing {escape} key
        userEvent.type(lineageInput,"{esc}");
        expect(menuRoot).not.toBeVisible();
    })
    test("TEST: toggle display sublineages of A",async()=>{
        const lineageInput = screen.getByPlaceholderText("lineage");
        const menuRoot = screen.getByTestId("dropdown-root");
        expect(menuRoot).not.toBeVisible();

        userEvent.click(lineageInput);
        userEvent.type(lineageInput,"A");
        expect(lineageInput.value).toBe("A")
        expect(menuRoot).toBeVisible();
        
        // verify menuRoot.children are sublineages of A
        const expectedChildValues = Object.values(_g_lineage_trie.root.children['A'].children).map(e=>e.value)
        expectedChildValues.forEach(e=>expect(menuRoot.textContent).toContain(e))

        userEvent.type(lineageInput,"{esc}");
        expect(lineageInput.value).toBe("A")
        expect(menuRoot).not.toBeVisible();
    })
    test("TEST: toggle display sublineages of B.1", async()=>{
        const lineageInput = screen.getByPlaceholderText("lineage");
        const menuRoot = screen.getByTestId("dropdown-root");
        expect(menuRoot).not.toBeVisible();

        userEvent.click(lineageInput);
        userEvent.type(lineageInput,"B.1");
        expect(lineageInput.value).toBe("B.1")
        expect(menuRoot).toBeVisible();
        // verify menuRoot.children are sublineages of B.1
        const expectedChildValues = Object.values(_g_lineage_trie.root.children['B'].children['1'].children).map(e=>e.value)
        expectedChildValues.forEach(e=>expect(menuRoot.textContent).toContain(e));
        
        userEvent.type(lineageInput,"{esc}");
        expect(lineageInput.value).toBe("B.1")
        expect(menuRoot).not.toBeVisible();
    })

})
